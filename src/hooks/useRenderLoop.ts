import { useCallback, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { toCanvas } from 'html-to-image';
import { mkdir, writeFile } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { join, downloadDir } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-shell';
import { useRenderStore, type ExportFormat } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';

export type RenderOptions = {
  node: HTMLElement | null;
  durationMs: number;
  fps?: number;
  outputName?: string;
  format?: ExportFormat;
};

export type RenderState = {
  isRendering: boolean;
  progress: number;
  totalFrames: number;
  currentFrame: number;
  framesDir?: string;
  outputPath?: string;
  error?: string;
};

// Seek timeline and wait for React to re-render synchronously
const seekTimeline = (timeMs: number) => {
  flushSync(() => {
    useTimelineStore.getState().setPlayhead(timeMs);
  });
};

// Pause/seek any Web Animations API animations
const pauseAndSeekAnimations = (node: HTMLElement, timeMs: number) => {
  const animations = node.getAnimations({ subtree: true });
  for (const animation of animations) {
    animation.pause();
    animation.currentTime = timeMs;
  }
};

// Wait for next animation frame + paint
const waitForRender = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

// Convert canvas to PNG blob using OffscreenCanvas for speed
const canvasToBlob = async (canvas: HTMLCanvasElement): Promise<Blob> => {
  if (typeof OffscreenCanvas !== 'undefined') {
    const offscreen = new OffscreenCanvas(canvas.width, canvas.height);
    const ctx = offscreen.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, 0);
      return offscreen.convertToBlob({ type: 'image/png' });
    }
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/png'
    );
  });
};

const frameFileName = (index: number) => `frame_${String(index + 1).padStart(5, '0')}.png`;

const getFileExtension = (format: ExportFormat): string => {
  switch (format) {
    case 'webm': return 'webm';
    case 'mov': return 'mov';
    case 'png': return 'png';
    case 'gif': return 'gif';
    case 'mp4':
    default: return 'mp4';
  }
};

// Concurrent queue for parallel disk writes
const createQueue = (concurrency: number) => {
  let active = 0;
  const queue: (() => Promise<void>)[] = [];

  const next = () => {
    while (active < concurrency && queue.length > 0) {
      active++;
      const fn = queue.shift()!;
      fn().finally(() => {
        active--;
        next();
      });
    }
  };

  return (fn: () => Promise<void>) =>
    new Promise<void>((resolve, reject) => {
      queue.push(() => fn().then(resolve, reject));
      next();
    });
};

// Get or create Liike export folder
const getExportFolder = async (): Promise<string> => {
  const downloads = await downloadDir();
  const liikeFolder = await join(downloads, 'Liike');
  try {
    await mkdir(liikeFolder, { recursive: true });
  } catch {
    // Folder might already exist
  }
  return liikeFolder;
};

// Generate unique filename
const getUniqueFilename = (baseName: string, ext: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${baseName}_${timestamp}.${ext}`;
};

const cleanupTempFiles = async (framesDir: string) => {
  if (!framesDir) return;
  try {
    await invoke('cleanup_temp_dir', { dirPath: framesDir });
  } catch {
    // Ignore cleanup errors - dir might already be cleaned or never created
  }
};

export const useRenderLoop = () => {
  const { setRenderStatus, resetRenderStatus, canvasWidth, canvasHeight } = useRenderStore();
  const [state, setState] = useState<RenderState>({
    isRendering: false,
    progress: 0,
    totalFrames: 0,
    currentFrame: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const unlistenProgressRef = useRef<UnlistenFn | null>(null);

  const resetState = useCallback(() => {
    setState({
      isRendering: false,
      progress: 0,
      totalFrames: 0,
      currentFrame: 0,
      error: undefined,
      framesDir: undefined,
      outputPath: undefined,
    });
    resetRenderStatus();
  }, [resetRenderStatus]);

  const render = useCallback(
    async ({
      node,
      durationMs,
      fps = 30,
      outputName = 'liike_export',
      format = 'mp4',
    }: RenderOptions) => {
      console.log('[Render] Starting export:', { format, durationMs, fps, node: !!node });

      if (!node) {
        const error = 'Missing node to render.';
        console.error('[Render]', error);
        setState((prev) => ({ ...prev, error }));
        setRenderStatus({ error });
        return;
      }

      const isPngExport = format === 'png';
      const isVideoExport = !isPngExport;

      // For video export, require a minimum duration
      if (isVideoExport && durationMs < 100) {
        const error = 'Video export requires a duration. Add clips to the timeline first.';
        console.error('[Render]', error);
        setState((prev) => ({ ...prev, error }));
        setRenderStatus({ error });
        return;
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const totalFrames = isPngExport ? 1 : Math.max(1, Math.ceil((durationMs / 1000) * fps));
      console.log('[Render] Total frames:', totalFrames);

      // Use canvas dimensions from store for output size
      const outputWidth = canvasWidth || 1080;
      const outputHeight = canvasHeight || 1080;

      // Calculate pixelRatio based on canvas size vs node size
      const nodeRect = node.getBoundingClientRect();
      const pixelRatio = Math.max(outputWidth / nodeRect.width, outputHeight / nodeRect.height);
      console.log('[Render] Output size:', outputWidth, 'x', outputHeight, 'pixelRatio:', pixelRatio);

      // Setup folders
      const exportFolder = await getExportFolder();
      const ext = getFileExtension(format);
      const filename = getUniqueFilename(outputName, ext);
      const outputPath = await join(exportFolder, filename);
      console.log('[Render] Output path:', outputPath);

      // Temp folder for frames (video only)
      let framesDir = '';
      if (isVideoExport) {
        framesDir = await join(exportFolder, `temp_frames_${Date.now()}`);
        await mkdir(framesDir, { recursive: true });
        console.log('[Render] Frames dir:', framesDir);
      }

      // Pause playback
      useTimelineStore.getState().setIsPlaying(false);

      setState({
        isRendering: true,
        progress: 0,
        totalFrames,
        currentFrame: 0,
        framesDir: framesDir || undefined,
        outputPath,
        error: undefined,
      });
      setRenderStatus({
        isRendering: true,
        progress: 0,
        totalFrames,
        currentFrame: 0,
        error: null,
        phase: 'capturing',
      });

      // html-to-image options for accurate capture
      const captureOptions = {
        pixelRatio,
        cacheBust: false,
        skipAutoScale: true,
        includeQueryParams: true,
        skipFonts: false,
        preferredFontFormat: 'woff2' as const,
        // Ensure proper rendering of shadows and transforms
        style: {
          transformStyle: 'preserve-3d',
        },
        // Use foreignObject for better shadow/transform support
        useForeignObjectRendering: false,
      };

      try {
        // PNG Export - capture current canvas state directly
        if (isPngExport) {
          console.log('[Render] PNG export - capturing current state');

          // Just wait for any pending renders
          await waitForRender();

          const canvas = await toCanvas(node, captureOptions);
          console.log('[Render] Canvas captured:', canvas.width, 'x', canvas.height);

          const blob = await canvasToBlob(canvas);
          console.log('[Render] Blob created:', blob.size, 'bytes');

          const bytes = new Uint8Array(await blob.arrayBuffer());
          await writeFile(outputPath, bytes);
          console.log('[Render] PNG saved to:', outputPath);

          setState((prev) => ({ ...prev, isRendering: false, progress: 1, outputPath }));
          setRenderStatus({ isRendering: false, progress: 1, phase: 'done' });

          // Open export folder
          await open(exportFolder);
          return;
        }

        // Video Export - capture all frames
        console.log('[Render] Video export - capturing', totalFrames, 'frames');

        // Seek to start
        seekTimeline(0);
        pauseAndSeekAnimations(node, 0);
        await waitForRender();

        const writeQueue = createQueue(10);
        const writePromises: Promise<void>[] = [];

        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
          if (abortController.signal.aborted) {
            console.log('[Render] Aborted at frame', frameIndex);
            resetState();
            await cleanupTempFiles(framesDir);
            return;
          }

          const t = (frameIndex / fps) * 1000;

          // Seek timeline (React state-based animations)
          seekTimeline(t);
          // Seek Web Animations API animations
          pauseAndSeekAnimations(node, t);
          // Wait for DOM to fully update
          await waitForRender();

          // Capture to canvas
          const canvas = await toCanvas(node, captureOptions);

          // Convert to blob
          const blob = await canvasToBlob(canvas);

          // Queue disk write (parallel I/O)
          const frameNum = frameIndex;
          writePromises.push(
            writeQueue(async () => {
              const bytes = new Uint8Array(await blob.arrayBuffer());
              const filePath = await join(framesDir, frameFileName(frameNum));
              await writeFile(filePath, bytes);
            })
          );

          // Update progress
          const progress = (frameIndex + 1) / totalFrames;
          setState((prev) => ({
            ...prev,
            currentFrame: frameIndex + 1,
            progress,
          }));
          setRenderStatus({
            currentFrame: frameIndex + 1,
            progress,
          });
        }

        // Wait for all disk writes
        await Promise.all(writePromises);
        console.log('[Render] All frames written');
      } catch (error) {
        const errorMsg = (error as Error).message;
        console.error('[Render] Capture error:', errorMsg);
        setState((prev) => ({ ...prev, error: errorMsg, isRendering: false }));
        setRenderStatus({ error: errorMsg, isRendering: false, phase: 'idle' });
        if (framesDir) await cleanupTempFiles(framesDir);
        return;
      }

      // Video encoding phase
      console.log('[Render] Starting video encoding');
      setRenderStatus({ phase: 'encoding', progress: 0 });

      try {
        unlistenProgressRef.current = await listen<{ progress: number }>(
          'encode-video-progress',
          (event) => {
            const next = Math.min(1, event.payload.progress);
            setState((prev) => ({ ...prev, progress: next }));
            setRenderStatus({ progress: next });
          }
        );

        await invoke('encode_video', {
          framesDir,
          outputPath,
          fps,
          format,
          width: outputWidth,
          height: outputHeight,
        });

        console.log('[Render] Video encoded successfully');
        setState((prev) => ({ ...prev, isRendering: false, progress: 1, outputPath }));
        setRenderStatus({ isRendering: false, progress: 1, phase: 'done' });

        // Cleanup temp frames
        await cleanupTempFiles(framesDir);

        // Open export folder
        await open(exportFolder);
      } catch (error) {
        const errorMsg = (error as Error).message;
        console.error('[Render] Encoding error:', errorMsg);
        setState((prev) => ({ ...prev, error: errorMsg, isRendering: false }));
        setRenderStatus({ error: errorMsg, isRendering: false, phase: 'idle' });
        await cleanupTempFiles(framesDir);
      } finally {
        if (unlistenProgressRef.current) {
          unlistenProgressRef.current();
          unlistenProgressRef.current = null;
        }
      }
    },
    [resetState, setRenderStatus, canvasWidth, canvasHeight]
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    if (unlistenProgressRef.current) {
      unlistenProgressRef.current();
      unlistenProgressRef.current = null;
    }
    resetState();
    resetRenderStatus();
  }, [resetState, resetRenderStatus]);

  return useMemo(
    () => ({ render, cancel, state }),
    [cancel, render, state]
  );
};

export type RenderLoopApi = ReturnType<typeof useRenderLoop>;
