use serde::Serialize;
use std::collections::HashMap;
use std::io::Write;
use std::path::PathBuf;
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::{Arc, Mutex};
use tauri::Emitter;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

#[derive(Serialize, Clone)]
struct ProgressPayload {
    progress: f32,
    message: String,
}

// Streaming encoder state - holds ffmpeg process and stdin for direct piping
struct StreamingEncoder {
    process: Child,
    stdin: ChildStdin,
    width: u32,
    height: u32,
    total_frames: u32,
    current_frame: u32,
}

// Global encoder registry for managing multiple concurrent encoders
lazy_static::lazy_static! {
    static ref ENCODERS: Arc<Mutex<HashMap<String, StreamingEncoder>>> = Arc::new(Mutex::new(HashMap::new()));
}

fn parse_frame(line: &str) -> Option<u32> {
    line.strip_prefix("frame=")?
        .trim()
        .split_whitespace()
        .next()?
        .parse::<u32>()
        .ok()
}

fn parse_out_time(line: &str) -> Option<f32> {
    let time_str = line.strip_prefix("out_time_ms=")?.trim();
    let millis: f32 = time_str.parse().ok()?;
    Some(millis / 1000.0)
}

#[tauri::command]
async fn copy_file(src: String, dest: String) -> Result<(), String> {
    std::fs::copy(&src, &dest).map_err(|e| format!("Failed to copy file: {e}"))?;
    Ok(())
}

fn get_encoder_args(format: &str, width: u32, height: u32, use_hw: bool) -> Vec<String> {
    // Scale filter - use fast_bilinear for speed, lanczos only if needed
    let scale_w = if width % 2 == 0 { width } else { width + 1 };
    let scale_h = if height % 2 == 0 { height } else { height + 1 };
    let scale_filter = format!("scale={}:{}:flags=bilinear", scale_w, scale_h);

    let is_macos = std::env::consts::OS == "macos";
    let is_windows = std::env::consts::OS == "windows";

    match format {
        "webm" => vec![
            "-vf".to_string(),
            scale_filter,
            "-c:v".to_string(),
            "libvpx-vp9".to_string(),
            "-crf".to_string(),
            "28".to_string(),
            "-b:v".to_string(),
            "0".to_string(),
            "-pix_fmt".to_string(),
            "yuv420p".to_string(),
            "-row-mt".to_string(),
            "1".to_string(),
            "-threads".to_string(),
            "0".to_string(),
            "-deadline".to_string(),
            "realtime".to_string(), // Fastest
            "-cpu-used".to_string(),
            "5".to_string(), // Max speed (0-5)
            "-tile-columns".to_string(),
            "2".to_string(),
            "-frame-parallel".to_string(),
            "1".to_string(),
        ],
        "mov" => {
            if use_hw && is_macos {
                // HEVC VideoToolbox - macOS (fastest, excellent quality)
                vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "hevc_videotoolbox".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-q:v".to_string(),
                    "65".to_string(), // Quality-based (0-100, higher=better)
                    "-realtime".to_string(),
                    "1".to_string(),
                    "-tag:v".to_string(),
                    "hvc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                ]
            } else if use_hw && is_windows {
                // HEVC NVENC - Windows NVIDIA
                vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "hevc_nvenc".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-preset".to_string(),
                    "p1".to_string(), // Fastest preset
                    "-tune".to_string(),
                    "hq".to_string(),
                    "-rc".to_string(),
                    "vbr".to_string(),
                    "-cq".to_string(),
                    "24".to_string(),
                    "-tag:v".to_string(),
                    "hvc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                ]
            } else {
                // Software HEVC - ultrafast preset
                vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "libx265".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-preset".to_string(),
                    "ultrafast".to_string(),
                    "-crf".to_string(),
                    "24".to_string(),
                    "-tag:v".to_string(),
                    "hvc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                ]
            }
        }
        "gif" => {
            // Optimized GIF - reduce fps and colors for speed
            let gif_filter = format!("{},fps=12,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3", scale_filter);
            vec![
                "-vf".to_string(),
                gif_filter,
                "-loop".to_string(),
                "0".to_string(),
            ]
        }
        // MP4 - H.264 for universal compatibility
        // MP4 - User requested HEVC (H.265) for speed/quality
        _ => {
            if use_hw && is_macos {
                // HEVC VideoToolbox - macOS
                vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "hevc_videotoolbox".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-q:v".to_string(),
                    "65".to_string(), // High quality
                    "-realtime".to_string(),
                    "1".to_string(),
                    "-tag:v".to_string(),
                    "hvc1".to_string(), // Essential for MP4 HEVC compatibility in QuickTime/Finder
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                ]
            } else if use_hw && is_windows {
                // HEVC NVENC - Windows NVIDIA
                vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "hevc_nvenc".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-preset".to_string(),
                    "p1".to_string(),
                    "-tune".to_string(),
                    "hq".to_string(),
                    "-rc".to_string(),
                    "vbr".to_string(),
                    "-cq".to_string(),
                    "24".to_string(),
                    "-tag:v".to_string(),
                    "hvc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                ]
            } else {
                // Software HEVC
                vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "libx265".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-preset".to_string(),
                    "ultrafast".to_string(),
                    "-crf".to_string(),
                    "24".to_string(),
                    "-tag:v".to_string(),
                    "hvc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                ]
            }
        }
    }
}

#[tauri::command]
async fn encode_video(
    app: tauri::AppHandle,
    frames_dir: String,
    output_path: String,
    fps: Option<u32>,
    format: Option<String>,
    width: Option<u32>,
    height: Option<u32>,
    use_hw: Option<bool>,
) -> Result<(), String> {
    let fps = fps.unwrap_or(30);
    let format = format.unwrap_or_else(|| "mp4".to_string());
    let width = width.unwrap_or(1080);
    let height = height.unwrap_or(1080);
    let use_hw = use_hw.unwrap_or(true); // Default to hardware encoding

    // Use PNG frames (more compatible than WebP for raw streams)
    let input_pattern = PathBuf::from(&frames_dir).join("frame_%05d.png");
    let input_pattern_str = input_pattern.to_string_lossy().to_string();
    let output_path_owned = output_path.clone();

    let total_frames = std::fs::read_dir(&frames_dir)
        .map_err(|e| format!("Failed to read frames dir: {e}"))?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with("frame_") && name.ends_with(".png") {
                Some(())
            } else {
                None
            }
        })
        .count();

    let total_duration = (total_frames as f32 / fps as f32).max(0.01);

    let mut exit_code: Option<i32> = None;

    let mut args = vec![
        "-y".to_string(),
        "-hide_banner".to_string(),
        "-progress".to_string(),
        "pipe:1".to_string(),
        "-framerate".to_string(),
        fps.to_string(),
        "-i".to_string(),
        input_pattern_str.clone(),
    ];

    args.extend(get_encoder_args(&format, width, height, use_hw));
    args.push(output_path_owned.clone());

    let args_refs: Vec<&str> = args.iter().map(|s| s.as_str()).collect();

    let (mut rx, _child) = app
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| format!("Could not resolve ffmpeg sidecar: {e}"))?
        .args(&args_refs)
        .spawn()
        .map_err(|e| format!("Failed to spawn ffmpeg: {e}"))?;

    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(bytes) => {
                let line = String::from_utf8_lossy(&bytes).to_string();
                let mut progress = None;
                if let Some(frame) = parse_frame(&line) {
                    if total_frames > 0 {
                        progress = Some(frame as f32 / total_frames as f32);
                    }
                }

                if progress.is_none() {
                    if let Some(out_time) = parse_out_time(&line) {
                        progress = Some((out_time / total_duration).min(1.0));
                    }
                }

                if let Some(value) = progress {
                    let _ = app.emit(
                        "encode-video-progress",
                        ProgressPayload {
                            progress: value,
                            message: line.clone(),
                        },
                    );
                }
            }
            CommandEvent::Stderr(bytes) => {
                let line = String::from_utf8_lossy(&bytes).to_string();
                let _ = app.emit(
                    "encode-video-progress",
                    ProgressPayload {
                        progress: 0.0,
                        message: line,
                    },
                );
            }
            CommandEvent::Error(message) => {
                let _ = app.emit(
                    "encode-video-progress",
                    ProgressPayload {
                        progress: 0.0,
                        message,
                    },
                );
            }
            CommandEvent::Terminated(payload) => {
                exit_code = payload.code;
            }
            _ => {}
        }
    }

    if let Some(code) = exit_code {
        if code != 0 {
            return Err(format!("ffmpeg exited with code {}", code));
        }
    }

    let _ = app.emit(
        "encode-video-progress",
        ProgressPayload {
            progress: 1.0,
            message: "done".into(),
        },
    );

    Ok(())
}

#[tauri::command]
async fn cleanup_temp_dir(dir_path: String) -> Result<(), String> {
    std::fs::remove_dir_all(&dir_path).map_err(|e| format!("Failed to cleanup temp dir: {e}"))?;
    Ok(())
}

#[tauri::command]
async fn precise_sleep(ms: u64) -> Result<(), String> {
    tokio::time::sleep(std::time::Duration::from_millis(ms)).await;
    Ok(())
}

// Get ffmpeg binary path for the current platform
fn get_ffmpeg_path() -> Result<PathBuf, String> {
    let exe_dir = std::env::current_exe()
        .map_err(|e| format!("Failed to get exe path: {e}"))?
        .parent()
        .ok_or("Failed to get exe parent dir")?
        .to_path_buf();

    let os = std::env::consts::OS;
    let arch = std::env::consts::ARCH;

    let binary_name = if os == "windows" {
        format!("ffmpeg-{}-{}.exe", arch, os)
    } else {
        format!("ffmpeg-{}-{}", arch, os)
    };

    // Try different locations based on dev vs production
    let possible_paths = vec![
        exe_dir.join(&binary_name),
        exe_dir.join("../Resources").join(&binary_name), // macOS bundle
        exe_dir.join("bin").join(&binary_name),
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("bin").join(&binary_name),
    ];

    for path in &possible_paths {
        if path.exists() {
            return Ok(path.clone());
        }
    }

    // Fallback to system ffmpeg
    Ok(PathBuf::from("ffmpeg"))
}

// Get encoder arguments for rawvideo input (streaming mode)
fn get_streaming_encoder_args(format: &str, width: u32, height: u32, fps: u32, use_hw: bool) -> Vec<String> {
    let scale_w = if width % 2 == 0 { width } else { width + 1 };
    let scale_h = if height % 2 == 0 { height } else { height + 1 };
    let scale_filter = format!("scale={}:{}:flags=bilinear", scale_w, scale_h);

    let is_macos = std::env::consts::OS == "macos";
    let is_windows = std::env::consts::OS == "windows";

    // Input args for rawvideo from stdin
    let mut args = vec![
        "-y".to_string(),
        "-f".to_string(),
        "rawvideo".to_string(),
        "-pix_fmt".to_string(),
        "rgba".to_string(),
        "-s".to_string(),
        format!("{}x{}", width, height),
        "-r".to_string(),
        fps.to_string(),
        "-i".to_string(),
        "pipe:0".to_string(), // Read from stdin
    ];

    // Output encoding args based on format
    match format {
        "webm" => {
            args.extend(vec![
                "-vf".to_string(),
                scale_filter,
                "-c:v".to_string(),
                "libvpx-vp9".to_string(),
                "-crf".to_string(),
                "28".to_string(), // High quality (balanced)
                "-b:v".to_string(),
                "0".to_string(),
                "-pix_fmt".to_string(),
                "yuv420p".to_string(),
                "-deadline".to_string(),
                "realtime".to_string(),
                "-cpu-used".to_string(),
                "5".to_string(), // Faster encoding
            ]);
        }
        "gif" => {
            let gif_filter = format!("{},fps=15,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3", scale_filter);
            args.extend(vec![
                "-vf".to_string(),
                gif_filter,
                "-loop".to_string(),
                "0".to_string(),
            ]);
        }
        _ => {
            // MP4/MOV - use hardware encoding when available
            if use_hw && is_macos {
                args.extend(vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "hevc_videotoolbox".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-q:v".to_string(),
                    "70".to_string(), // High quality (balanced size)
                    "-realtime".to_string(),
                    "1".to_string(),
                    "-tag:v".to_string(),
                    "hvc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                    "-color_primaries".to_string(), "bt709".to_string(),
                    "-color_trc".to_string(), "bt709".to_string(),
                    "-colorspace".to_string(), "bt709".to_string(),
                ]);
            } else if use_hw && is_windows {
                args.extend(vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "hevc_nvenc".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-preset".to_string(),
                    "p4".to_string(), // Balanced preset
                    "-tune".to_string(),
                    "hq".to_string(),
                    "-rc".to_string(),
                    "vbr".to_string(),
                    "-cq".to_string(),
                    "24".to_string(), // High quality (balanced size)
                    "-tag:v".to_string(),
                    "hvc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                    "-color_primaries".to_string(), "bt709".to_string(),
                    "-color_trc".to_string(), "bt709".to_string(),
                    "-colorspace".to_string(), "bt709".to_string(),
                ]);
            } else {
                // Software encoding fallback
                args.extend(vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "libx265".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-preset".to_string(),
                    "veryfast".to_string(), // Faster
                    "-crf".to_string(),
                    "24".to_string(), // High quality (balanced size)
                    "-tag:v".to_string(),
                    "hvc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                    "-color_primaries".to_string(), "bt709".to_string(),
                    "-color_trc".to_string(), "bt709".to_string(),
                    "-colorspace".to_string(), "bt709".to_string(),
                ]);
            }
        }
    }

    args
}

/// Start a streaming encoder session - spawns ffmpeg and returns encoder ID
#[tauri::command]
fn start_streaming_encode(
    output_path: String,
    width: u32,
    height: u32,
    fps: u32,
    total_frames: u32,
    format: Option<String>,
    use_hw: Option<bool>,
) -> Result<String, String> {
    let format = format.unwrap_or_else(|| "mp4".to_string());
    let use_hw = use_hw.unwrap_or(true);

    let ffmpeg_path = get_ffmpeg_path()?;
    let mut args = get_streaming_encoder_args(&format, width, height, fps, use_hw);
    args.push(output_path.clone());

    log::info!("[StreamEncode] Starting ffmpeg: {:?} {:?}", ffmpeg_path, args);

    let mut process = Command::new(&ffmpeg_path)
        .args(&args)
        .stdin(Stdio::piped())
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn ffmpeg: {e}"))?;

    let stdin = process
        .stdin
        .take()
        .ok_or("Failed to get ffmpeg stdin")?;

    let encoder_id = format!("encoder_{}", std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis());

    let encoder = StreamingEncoder {
        process,
        stdin,
        width,
        height,
        total_frames,
        current_frame: 0,
    };

    ENCODERS
        .lock()
        .map_err(|e| format!("Failed to lock encoders: {e}"))?
        .insert(encoder_id.clone(), encoder);

    log::info!("[StreamEncode] Encoder started: {}", encoder_id);
    Ok(encoder_id)
}

/// Send a single frame to the streaming encoder
/// frame_data: Base64-encoded RGBA pixel data
#[tauri::command]
fn send_frame(encoder_id: String, frame_data: String) -> Result<f32, String> {
    use base64::Engine;
    
    let rgba_bytes = base64::engine::general_purpose::STANDARD
        .decode(&frame_data)
        .map_err(|e| format!("Failed to decode base64: {e}"))?;

    let mut encoders = ENCODERS
        .lock()
        .map_err(|e| format!("Failed to lock encoders: {e}"))?;

    let encoder = encoders
        .get_mut(&encoder_id)
        .ok_or_else(|| format!("Encoder not found: {}", encoder_id))?;

    // Write raw RGBA bytes directly to ffmpeg stdin
    encoder
        .stdin
        .write_all(&rgba_bytes)
        .map_err(|e| format!("Failed to write frame: {e}"))?;

    encoder.current_frame += 1;
    let progress = encoder.current_frame as f32 / encoder.total_frames as f32;

    Ok(progress)
}

/// Finish the streaming encode and cleanup
#[tauri::command]
fn finish_streaming_encode(encoder_id: String) -> Result<(), String> {
    let mut encoders = ENCODERS
        .lock()
        .map_err(|e| format!("Failed to lock encoders: {e}"))?;

    let mut encoder = encoders
        .remove(&encoder_id)
        .ok_or_else(|| format!("Encoder not found: {}", encoder_id))?;

    // Close stdin to signal EOF to ffmpeg
    drop(encoder.stdin);

    // Wait for ffmpeg to finish
    let status = encoder
        .process
        .wait()
        .map_err(|e| format!("Failed to wait for ffmpeg: {e}"))?;

    if !status.success() {
        return Err(format!("ffmpeg exited with status: {}", status));
    }

    log::info!("[StreamEncode] Encoder finished: {} ({} frames)", encoder_id, encoder.current_frame);
    Ok(())
}

/// Cancel a streaming encode session
#[tauri::command]
fn cancel_streaming_encode(encoder_id: String) -> Result<(), String> {
    let mut encoders = ENCODERS
        .lock()
        .map_err(|e| format!("Failed to lock encoders: {e}"))?;

    if let Some(mut encoder) = encoders.remove(&encoder_id) {
        // Kill the ffmpeg process
        let _ = encoder.process.kill();
        log::info!("[StreamEncode] Encoder cancelled: {}", encoder_id);
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            encode_video,
            copy_file,
            cleanup_temp_dir,
            precise_sleep,
            start_streaming_encode,
            send_frame,
            finish_streaming_encode,
            cancel_streaming_encode
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

