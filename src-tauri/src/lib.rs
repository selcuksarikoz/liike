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

fn get_encoder_args(format: &str, width: u32, height: u32) -> Vec<String> {
  // Scale filter with proper color handling for vivid output
  let scale_w = if width % 2 == 0 { width } else { width + 1 };
  let scale_h = if height % 2 == 0 { height } else { height + 1 };
  let scale_filter = format!("scale={}:{}:flags=lanczos:in_color_matrix=bt709:out_color_matrix=bt709", scale_w, scale_h);

  match format {
    "webm" => vec![
      "-vf".to_string(), scale_filter,
      "-c:v".to_string(), "libvpx-vp9".to_string(),
      "-crf".to_string(), "18".to_string(),
      "-b:v".to_string(), "0".to_string(),
      "-pix_fmt".to_string(), "yuv420p".to_string(),
      "-colorspace".to_string(), "bt709".to_string(),
      "-color_primaries".to_string(), "bt709".to_string(),
      "-color_trc".to_string(), "bt709".to_string(),
      "-row-mt".to_string(), "1".to_string(),
      "-threads".to_string(), "0".to_string(),
    ],
    "mov" => vec![
      "-vf".to_string(), scale_filter,
      "-c:v".to_string(), "prores_ks".to_string(),
      "-profile:v".to_string(), "3".to_string(),
      "-pix_fmt".to_string(), "yuv422p10le".to_string(),
      "-colorspace".to_string(), "bt709".to_string(),
      "-color_primaries".to_string(), "bt709".to_string(),
      "-color_trc".to_string(), "bt709".to_string(),
      "-vendor".to_string(), "apl0".to_string(),
    ],
    "gif" => {
      let gif_filter = format!("{},fps=15,split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=full[p];[s1][p]paletteuse=dither=sierra2_4a", scale_filter);
      vec![
        "-vf".to_string(), gif_filter,
        "-loop".to_string(), "0".to_string(),
      ]
    },
    // MP4 with H.265/HEVC for better quality and smaller size
    _ => vec![
      "-vf".to_string(), scale_filter,
      "-c:v".to_string(), "libx265".to_string(),
      "-pix_fmt".to_string(), "yuv420p".to_string(),
      "-preset".to_string(), "medium".to_string(),
      "-crf".to_string(), "20".to_string(),
      "-tag:v".to_string(), "hvc1".to_string(), // Apple compatibility
      "-colorspace".to_string(), "bt709".to_string(),
      "-color_primaries".to_string(), "bt709".to_string(),
      "-color_trc".to_string(), "bt709".to_string(),
      "-movflags".to_string(), "+faststart".to_string(),
    ],
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
) -> Result<(), String> {
  let fps = fps.unwrap_or(30);
  let format = format.unwrap_or_else(|| "mp4".to_string());
  let width = width.unwrap_or(1080);
  let height = height.unwrap_or(1080);

  let input_pattern = PathBuf::from(&frames_dir).join("frame_%05d.png");
  let input_pattern_str = input_pattern.to_string_lossy().to_string();
  let output_path_owned = output_path.clone();

  let total_frames = std::fs::read_dir(&frames_dir)
    .map_err(|e| format!("Failed to read frames dir: {e}"))?
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

  args.extend(get_encoder_args(&format, width, height));
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
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![encode_video, copy_file, cleanup_temp_dir, precise_sleep])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
