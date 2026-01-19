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
async fn encode_video(
  app: tauri::AppHandle,
  frames_dir: String,
  output_path: String,
  fps: Option<u32>,
) -> Result<(), String> {
  let fps = fps.unwrap_or(30);
  let input_pattern = PathBuf::from(&frames_dir).join("frame_%03d.png");
  let input_pattern_str = input_pattern.to_string_lossy().to_string();
  let output_path_owned = output_path.clone();

  let total_frames = std::fs::read_dir(&frames_dir)
    .map_err(|e| format!("Failed to read frames dir: {e}"))?
    .count();

  let total_duration = (total_frames as f32 / fps as f32).max(0.01);

  let mut exit_code: Option<i32> = None;

  let (mut rx, _child) = app
    .shell()
    .sidecar("ffmpeg")
    .map_err(|e| format!("Could not resolve ffmpeg sidecar: {e}"))?
    .args([
      "-y",
      "-hide_banner",
      "-progress",
      "pipe:1",
      "-framerate",
      &fps.to_string(),
      "-i",
      input_pattern_str.as_str(),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "medium",
      "-crf",
      "18",
      "-movflags",
      "+faststart",
      output_path_owned.as_str(),
    ])
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![encode_video])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
