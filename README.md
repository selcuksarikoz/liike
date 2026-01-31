# Liike

Liike is a high-performance desktop video and image rendering application built with **Tauri**, **React**, and **FFmpeg**. It provides a modern interface for timeline-based rendering with streaming capabilities.

## 🚀 Features

- **Timeline-Based Editing**: Manage your project's duration and frames with a dedicated timeline.
- **Streaming Render**: Real-time streaming render for both video and image formats.
- **Cross-Platform**: Built with Tauri for native performance on macOS, Windows, and Linux.
- **FFmpeg Integration**: Powered by FFmpeg for robust encoding and exporting.
- **Modern UI**: Sleek interface built with React 19, Tailwind CSS, and Lucide icons.
- **State Management**: Robust state handling using Zustand.

## 🛠 Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Desktop Framework**: [Tauri v2](https://tauri.app/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Utilities**: Lucide React, PostCSS, TypeScript
- **Backend/Scripts**: Node.js, FFmpeg

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS)
- [pnpm](https://pnpm.io/) or [bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/) (for Tauri development)
- FFmpeg binaries (should be placed in `scripts/ffmpeg/` for bundling)

### Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:selcuksarikoz/liike.git
   cd liike
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

Run the web frontend in development mode:

```bash
pnpm dev
```

Run the Tauri desktop app in development mode:

```bash
pnpm tauri:dev
```

### Building for Production

To build the application for your current platform:

```bash
pnpm tauri:build
```

This script will:

1. Run `prepare-ffmpeg` to bundle the appropriate FFmpeg binary.
2. Build the production-ready frontend.
3. Compile the Rust-based Tauri core.

## 📁 Project Structure

- `src/`: React frontend source code.
  - `components/`: UI components (Header, Sidebar, Timeline, Workarea).
  - `hooks/`: Custom React hooks (e.g., `useStreamingRender`).
  - `store/`: Zustand state stores.
  - `services/`: External service integrations (e.g., font loading).
- `src-tauri/`: Tauri configuration and Rust code.
- `scripts/`: Build and utility scripts (e.g., FFmpeg preparation).
