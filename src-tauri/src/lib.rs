use serde::Serialize;
use std::path::PathBuf;
use tauri::Emitter;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

#[derive(Serialize, Clone)]
struct ProgressPayload {
    progress: f32,
    message: String,
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
                    "60".to_string(),
                    "-realtime".to_string(),
                    "1".to_string(),
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
                    "p1".to_string(), // Fastest
                    "-tune".to_string(),
                    "hq".to_string(),
                    "-rc".to_string(),
                    "vbr".to_string(),
                    "-cq".to_string(),
                    "22".to_string(),
                    "-movflags".to_string(),
                    "+faststart".to_string(),
                ]
            } else {
                // Software H.264 - veryfast for speed
                vec![
                    "-vf".to_string(),
                    scale_filter,
                    "-c:v".to_string(),
                    "libx264".to_string(),
                    "-pix_fmt".to_string(),
                    "yuv420p".to_string(),
                    "-preset".to_string(),
                    "veryfast".to_string(),
                    "-crf".to_string(),
                    "22".to_string(),
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

    // Use WebP frames (smaller file size than PNG)
    let input_pattern = PathBuf::from(&frames_dir).join("frame_%05d.webp");
    let input_pattern_str = input_pattern.to_string_lossy().to_string();
    let output_path_owned = output_path.clone();

    let total_frames = std::fs::read_dir(&frames_dir)
        .map_err(|e| format!("Failed to read frames dir: {e}"))?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with("frame_") && name.ends_with(".webp") {
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
            precise_sleep
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
