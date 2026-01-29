use serde::Serialize;
use std::collections::HashMap;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::sync::mpsc::{sync_channel, SyncSender, Receiver};
use std::thread;
use std::io::Write;
use tauri::Emitter;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

#[derive(Serialize, Clone)]
struct ProgressPayload {
    progress: f32,
    message: String,
}

// Streaming encoder state - holds channel sender and worker thread handle
struct StreamingEncoder {
    process: Option<Child>, // Wrapped in Option to take ownership during finish
    sender: Option<SyncSender<Option<Vec<u8>>>>, // Send None to signal EOF
    worker_thread: Option<thread::JoinHandle<Result<(), String>>>,
    input_width: u32,
    input_height: u32,
    total_frames: u32,
    current_frame: Arc<Mutex<u32>>, // Shared counter for progress
    last_error: Arc<Mutex<Option<String>>>, // Last ffmpeg/worker error for diagnostics
    log_path: PathBuf,
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
    // Scale filter - bicubic offers good quality/speed balance
    let scale_w = if width % 2 == 0 { width } else { width + 1 };
    let scale_h = if height % 2 == 0 { height } else { height + 1 };
    let scale_filter = format!("scale={}:{}:flags=bicubic", scale_w, scale_h);

    let is_macos = std::env::consts::OS == "macos";
    let is_windows = std::env::consts::OS == "windows";

    match format {
        "webm" => vec![
            "-vf".to_string(),
            scale_filter,
            "-c:v".to_string(),
            "libvpx-vp9".to_string(),
            "-crf".to_string(),
            "24".to_string(), // Better quality (lower = better)
            "-b:v".to_string(),
            "0".to_string(),
            "-pix_fmt".to_string(),
            "yuv420p".to_string(),
            "-row-mt".to_string(),
            "1".to_string(),
            "-threads".to_string(),
            "0".to_string(),
            "-deadline".to_string(),
            "good".to_string(), // Better quality than realtime
            "-cpu-used".to_string(),
            "4".to_string(), // Balance: 0=best quality, 5=fastest
            "-tile-columns".to_string(),
            "2".to_string(),
            "-auto-alt-ref".to_string(),
            "1".to_string(),
            "-lag-in-frames".to_string(),
            "25".to_string(), // Better compression
        ],
        "mov" => {
            if use_hw && is_macos {
                // H.264 VideoToolbox - macOS (fast and widely compatible)
                vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "h264_videotoolbox".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-q:v".to_string(),
                    "70".to_string(), // Quality-based (0-100, higher=better)
                    "-tag:v".to_string(),
                    "avc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                ]
            } else if use_hw && is_windows {
                // H.264 NVENC - Windows NVIDIA
                vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "h264_nvenc".to_string(),
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
                    "avc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                ]
            } else {
                // Software H.264 - fast preset with good quality
                vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "libx264".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-preset".to_string(),
                    "fast".to_string(),
                    "-crf".to_string(),
                    "21".to_string(),
                    "-tag:v".to_string(),
                    "avc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                ]
            }
        }
        "gif" => {
            // Optimized GIF - better color palette for quality
            let gif_filter = format!("{},fps=15,split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=diff[p];[s1][p]paletteuse=dither=floyd_steinberg", scale_filter);
            vec![
                "-vf".to_string(),
                gif_filter,
                "-loop".to_string(),
                "0".to_string(),
            ]
        }
        // MP4 - H.264 for speed + compatibility
        _ => {
            if use_hw && is_macos {
                // H.264 VideoToolbox - macOS
                vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "h264_videotoolbox".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-q:v".to_string(),
                    "70".to_string(), // High quality
                    "-tag:v".to_string(),
                    "avc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                ]
            } else if use_hw && is_windows {
                // H.264 NVENC - Windows NVIDIA
                vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "h264_nvenc".to_string(),
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
                    "avc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                ]
            } else {
                // Software H.264 - fast preset with good quality
                vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "libx264".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-preset".to_string(),
                    "fast".to_string(), // Better quality than ultrafast
                    "-crf".to_string(),
                    "21".to_string(), // Better quality (lower = better)
                    "-tag:v".to_string(),
                    "avc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                    "-color_primaries".to_string(), "bt709".to_string(),
                    "-color_trc".to_string(), "bt709".to_string(),
                    "-colorspace".to_string(), "bt709".to_string(),
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

    let mut binary_names = Vec::new();
    // Tauri externalBin uses target-triple naming (e.g., ffmpeg-aarch64-apple-darwin).
    if os == "windows" {
        binary_names.push(format!("ffmpeg-{}-pc-windows-msvc.exe", arch));
        binary_names.push(format!("ffmpeg-{}-pc-windows-gnu.exe", arch));
        binary_names.push(format!("ffmpeg-{}-{}.exe", arch, os));
        binary_names.push("ffmpeg.exe".to_string());
    } else if os == "macos" {
        binary_names.push(format!("ffmpeg-{}-apple-darwin", arch));
        binary_names.push("ffmpeg-universal-apple-darwin".to_string());
        binary_names.push(format!("ffmpeg-{}-{}", arch, os));
        binary_names.push("ffmpeg".to_string());
    } else {
        binary_names.push(format!("ffmpeg-{}-unknown-linux-gnu", arch));
        binary_names.push(format!("ffmpeg-{}-unknown-linux-musl", arch));
        binary_names.push(format!("ffmpeg-{}-{}", arch, os));
        binary_names.push("ffmpeg".to_string());
    }

    // Try different locations based on dev vs production
    let possible_dirs = vec![
        exe_dir.clone(),
        exe_dir.join("../Resources"), // macOS bundle
        exe_dir.join("../Resources/bin"), // macOS externalBin location
        exe_dir.join("bin"),
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("bin"),
    ];

    for name in &binary_names {
        for dir in &possible_dirs {
            let path = dir.join(name);
            if path.exists() {
                return Ok(path);
            }
        }
    }

    // Do not fall back to system ffmpeg in release; require bundled binary
    Err("ffmpeg binary not found in app bundle".into())
}

fn append_ffmpeg_log(path: &PathBuf, line: &str) {
    if let Ok(mut file) = std::fs::OpenOptions::new().create(true).append(true).open(path) {
        let _ = writeln!(file, "{}", line);
    }
}

fn validate_ffmpeg_path(path: &PathBuf) -> bool {
    Command::new(path)
        .arg("-version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|status| status.success())
        .unwrap_or(false)
}

// Get encoder arguments for rawvideo input (streaming mode)
fn get_streaming_encoder_args(
    format: &str,
    input_width: u32,
    input_height: u32,
    output_width: u32,
    output_height: u32,
    fps: u32,
    use_hw: bool,
    audio_path: Option<&str>
) -> Vec<String> {
    let scale_w = if output_width % 2 == 0 { output_width } else { output_width + 1 };
    let scale_h = if output_height % 2 == 0 { output_height } else { output_height + 1 };
    // Use bicubic for good quality/speed balance
    let scale_filter = format!("scale={}:{}:flags=bicubic", scale_w, scale_h);

    let is_macos = std::env::consts::OS == "macos";
    let is_windows = std::env::consts::OS == "windows";

    // Input args for rawvideo from stdin
    let mut args = vec![
        "-y".to_string(),
        "-f".to_string(),
        "rawvideo".to_string(),
        "-vcodec".to_string(),
        "rawvideo".to_string(),
        "-pix_fmt".to_string(),
        "rgba".to_string(),
        "-s".to_string(),
        format!("{}x{}", input_width, input_height),
        "-r".to_string(),
        fps.to_string(),
        "-i".to_string(),
        "pipe:0".to_string(), // Read from stdin
    ];

    // Add audio input if provided
    if let Some(audio) = audio_path {
        args.extend(vec![
            "-i".to_string(),
            audio.to_string(),
        ]);
    }

    // Explicitly map streams if audio is present
    if audio_path.is_some() {
        args.extend(vec![
            "-map".to_string(), "0:v:0".to_string(),
            "-map".to_string(), "1:a:0".to_string(),
        ]);
    }

    // Output encoding args based on format - PRIORITIZE QUALITY
    match format {
        "webm" => {
            args.extend(vec![
                "-vf".to_string(),
                scale_filter,
                "-c:v".to_string(),
                "libvpx-vp9".to_string(),
                "-crf".to_string(),
                "18".to_string(), // High quality (lower = better, 18-24 is excellent)
                "-b:v".to_string(),
                "0".to_string(),
                "-pix_fmt".to_string(),
                "yuva420p".to_string(),
                "-deadline".to_string(),
                "good".to_string(), // Better quality than realtime
                "-cpu-used".to_string(),
                "2".to_string(), // Quality-focused (0=best, 8=fastest)
                "-row-mt".to_string(),
                "1".to_string(),
                "-threads".to_string(),
                "0".to_string(), // Use all available threads
                "-tile-columns".to_string(),
                "2".to_string(),
                "-auto-alt-ref".to_string(),
                "1".to_string(),
                "-lag-in-frames".to_string(),
                "25".to_string(), // Better compression with lookahead
            ]);
        }
        "gif" => {
            let gif_filter = format!("{},fps=15,split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=diff[p];[s1][p]paletteuse=dither=floyd_steinberg", scale_filter);
            args.extend(vec![
                "-vf".to_string(),
                gif_filter,
                "-loop".to_string(),
                "0".to_string(),
            ]);
        }
        _ => {
            // MP4/MOV - H.264 for speed + compatibility
            if use_hw && is_macos {
                args.extend(vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "h264_videotoolbox".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-q:v".to_string(),
                    "75".to_string(), // High quality (0-100 scale)
                    "-tag:v".to_string(),
                    "avc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                    // Color space for accurate reproduction
                    "-color_primaries".to_string(), "bt709".to_string(),
                    "-color_trc".to_string(), "bt709".to_string(),
                    "-colorspace".to_string(), "bt709".to_string(),
                ]);
            } else if use_hw && is_windows {
                args.extend(vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "h264_nvenc".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-preset".to_string(),
                    "p6".to_string(), // High quality preset (p7 is slowest/best, p6 is good balance)
                    "-tune".to_string(),
                    "hq".to_string(),
                    "-rc".to_string(),
                    "vbr".to_string(),
                    "-cq".to_string(),
                    "19".to_string(), // High quality (lower = better)
                    "-b:v".to_string(),
                    "0".to_string(),
                    "-tag:v".to_string(),
                    "avc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                    "-color_primaries".to_string(), "bt709".to_string(),
                    "-color_trc".to_string(), "bt709".to_string(),
                    "-colorspace".to_string(), "bt709".to_string(),
                ]);
            } else {
                // Software encoding fallback - QUALITY FOCUSED
                args.extend(vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "libx264".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-preset".to_string(),
                    "medium".to_string(), // Good quality/speed balance
                    "-crf".to_string(),
                    "20".to_string(), // High quality (18-22 is excellent)
                    "-tag:v".to_string(),
                    "avc1".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                    "-threads".to_string(),
                    "0".to_string(), // Use all available threads
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
    audio_path: Option<String>,
    input_width: Option<u32>,
    input_height: Option<u32>,
) -> Result<String, String> {
    let format = format.unwrap_or_else(|| "mp4".to_string());
    let use_hw = use_hw.unwrap_or(true);
    let input_width = input_width.unwrap_or(width);
    let input_height = input_height.unwrap_or(height);
    let audio_path = audio_path.and_then(|p| {
        let trimmed = p.strip_prefix("file://").unwrap_or(&p).to_string();
        match std::fs::metadata(&trimmed) {
            Ok(_) => Some(trimmed),
            Err(e) => {
                log::warn!("[StreamEncode] Audio path not accessible, skipping audio: {} ({})", trimmed, e);
                None
            }
        }
    });

    let ffmpeg_path = get_ffmpeg_path()?;
    if !validate_ffmpeg_path(&ffmpeg_path) {
        return Err("ffmpeg binary not found or not runnable".into());
    }
    let mut args = get_streaming_encoder_args(
        &format,
        input_width,
        input_height,
        width,
        height,
        fps,
        use_hw,
        audio_path.as_deref(),
    );
    args.push(output_path.clone());

    let log_path = std::env::temp_dir().join("liike_ffmpeg.log");
    append_ffmpeg_log(&log_path, &format!("[StreamEncode] Starting ffmpeg with audio={:?}: {:?} {:?}", audio_path, ffmpeg_path, args));
    log::info!("[StreamEncode] Starting ffmpeg with audio={:?}: {:?} {:?}", audio_path, ffmpeg_path, args);

    let mut process = Command::new(&ffmpeg_path)
        .args(&args)
        .stdin(Stdio::piped())
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn ffmpeg: {e}"))?;

    let mut stdin = process
        .stdin
        .take()
        .ok_or("Failed to get ffmpeg stdin")?;

    let stderr = process.stderr.take().ok_or("Failed to get ffmpeg stderr")?;
    let last_error: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
    let stderr_error = last_error.clone();
    let stderr_log_path = log_path.clone();

    // Spawn a thread to drain stderr and prevent deadlock, and log messages
    thread::spawn(move || {
        use std::io::{BufRead, BufReader};
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(l) = line {
                *stderr_error.lock().unwrap() = Some(l.clone());
                append_ffmpeg_log(&stderr_log_path, &format!("[FFmpeg] {}", l));
                log::info!("[FFmpeg] {}", l);
            }
        }
    });

    // Create a bounded channel (size 60) for frame streaming
    // Increased to 60 (approx 2s at 30fps) to decouple frontend generation from encoding speed.
    // This prevents the frontend from stalling if ffmpeg has micro-stutters.
    let (tx, rx): (SyncSender<Option<Vec<u8>>>, Receiver<Option<Vec<u8>>>) = sync_channel(60);
    
    // Spawn worker thread for writing frames
    let worker_error = last_error.clone();
    let worker_log_path = log_path.clone();
    let worker_thread = thread::spawn(move || -> Result<(), String> {
        // Use BufWriter to reduce syscalls for large raw frames
        // 1080p RGBA is ~8MB per frame. 
        let mut writer = std::io::BufWriter::with_capacity(1024 * 1024, stdin); // 1MB buffer

        while let Ok(msg) = rx.recv() {
            match msg {
                Some(frame_data) => {
                    if let Err(e) = writer.write_all(&frame_data) {
                        append_ffmpeg_log(&worker_log_path, &format!("[StreamEncode] Worker write error: {}", e));
                        *worker_error.lock().unwrap() = Some(format!("Failed to write to ffmpeg stdin: {}", e));
                        return Err(format!("Failed to write to ffmpeg stdin: {}", e));
                    }
                }
                None => {
                    // EOF signal received
                    break;
                }
            }
        }
        // Explicit flush
        let _ = writer.flush();
        Ok(())
    });

    let encoder_id = format!("encoder_{}", std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis());

    let encoder = StreamingEncoder {
        process: Some(process),
        sender: Some(tx),
        worker_thread: Some(worker_thread),
        input_width,
        input_height,
        total_frames,
        current_frame: Arc::new(Mutex::new(0)),
        last_error,
        log_path,
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
fn send_frame(encoder_id: String, frame_data: Vec<u8>) -> Result<f32, String> {
    // 1. Lock: Short critical section just to get the sender
    let (sender, counter, total_frames, expected_size, last_error, log_path) = {
        let encoders = ENCODERS
            .lock()
            .map_err(|e| format!("Failed to lock encoders: {e}"))?;

        let encoder = encoders
            .get(&encoder_id)
            .ok_or_else(|| format!("Encoder not found: {}", encoder_id))?;

        let expected_size = (encoder.input_width * encoder.input_height * 4) as usize;
        let sender = encoder.sender.clone().ok_or("Encoder closed")?;
        
        (
            sender,
            encoder.current_frame.clone(),
            encoder.total_frames,
            expected_size,
            encoder.last_error.clone(),
            encoder.log_path.clone(),
        )
    };

    // 2. Validation (outside lock)
    if frame_data.len() != expected_size {
        return Err(format!("Invalid frame data size: expected {}, got {}", expected_size, frame_data.len()));
    }

    // 3. Send: Push to channel (may block if buffer full, but releases Mutex first!)
    // This allows other interactions to proceed.
    sender.send(Some(frame_data)).map_err(|_| {
        let err = last_error.lock().unwrap();
        if let Some(msg) = err.as_ref() {
            format!("Failed to send frame to worker thread: {} (log: {})", msg, log_path.display())
        } else {
            format!("Failed to send frame to worker thread (log: {})", log_path.display())
        }
    })?;

    // 4. Update progress
    let mut current = counter.lock().unwrap();
    *current += 1;
    let progress = *current as f32 / total_frames as f32;

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

    // 1. Signal EOF to worker thread
    if let Some(sender) = encoder.sender.take() {
        let _ = sender.send(None);
    }

    // 2. Wait for worker thread to flush and exit
    if let Some(worker) = encoder.worker_thread.take() {
        worker.join().map_err(|_| "Worker thread panicked")??;
    }

    // 3. Wait for ffmpeg to finish
    if let Some(mut process) = encoder.process.take() {
        let status = process
            .wait()
            .map_err(|e| format!("Failed to wait for ffmpeg: {e}"))?;

        if !status.success() {
            let err = encoder.last_error.lock().unwrap();
            if let Some(msg) = err.as_ref() {
                return Err(format!("ffmpeg exited with status: {} ({}) (log: {})", status, msg, encoder.log_path.display()));
            }
            return Err(format!("ffmpeg exited with status: {} (log: {})", status, encoder.log_path.display()));
        }
    }

    let frames = *encoder.current_frame.lock().unwrap();
    log::info!("[StreamEncode] Encoder finished: {} ({} frames)", encoder_id, frames);
    Ok(())
}

/// Cancel a streaming encode session
#[tauri::command]
fn cancel_streaming_encode(encoder_id: String) -> Result<(), String> {
    let mut encoders = ENCODERS
        .lock()
        .map_err(|e| format!("Failed to lock encoders: {e}"))?;

    if let Some(mut encoder) = encoders.remove(&encoder_id) {
        // Drop sender to signal worker thread
        encoder.sender = None;
        
        // Wait for worker (optional, but good for cleanup)
        if let Some(worker) = encoder.worker_thread.take() {
            let _ = worker.join();
        }

        // Kill the ffmpeg process
        if let Some(mut process) = encoder.process.take() {
            let _ = process.kill();
        }
        
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
