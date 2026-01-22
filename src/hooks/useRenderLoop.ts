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

// Seek all video elements in the node and wait for them to be ready
const seekVideos = async (node: HTMLElement, timeMs: number) => {
  const videos = Array.from(node.querySelectorAll('video'));
  if (videos.length === 0) return;

  const seekPromises = videos.map((video) => {
    return new Promise<void>((resolve) => {
      // If already at the right time (within small margin), skip
      if (Math.abs(video.currentTime - timeMs / 1000) < 0.05) {
        resolve();
        return;
      }

      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      
      // Safety timeout in case seek fails
      setTimeout(onSeeked, 500);

      video.addEventListener('seeked', onSeeked);
      video.pause();
      video.currentTime = timeMs / 1000;
    });
  });

  await Promise.all(seekPromises);
};

// Wait for DOM to update and paint
// Uses setTimeout instead of requestAnimationFrame to work in background
const waitForRender = (ms = 50) =>
  new Promise<void>((resolve) => {
    // Force multiple reflows to ensure DOM is fully updated
    document.body.offsetHeight;
    // Double RAF ensures paint is complete, then setTimeout for background support
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.offsetHeight; // Force another reflow
        setTimeout(resolve, ms);
      });
    });
  });

// Convert canvas to blob using OffscreenCanvas for speed
// Supports JPEG (video frames), PNG (lossless), WebP (lossless, smaller than PNG)
type BlobFormat = 'jpeg' | 'png' | 'webp';
const canvasToBlob = async (
  canvas: HTMLCanvasElement,
  format: BlobFormat = 'jpeg',
  bgColor?: string // Optional background color to fill (for video frames)
): Promise<Blob> => {
  const mimeType = `image/${format}`;
  // PNG/WebP: lossless (undefined = max quality), JPEG: 0.95 high quality
  const quality = format === 'jpeg' ? 0.95 : undefined;

  if (typeof OffscreenCanvas !== 'undefined') {
    const offscreen = new OffscreenCanvas(canvas.width, canvas.height);
    const ctx = offscreen.getContext('2d');
    if (ctx) {
      // Fill background if provided (for video frames) or for JPEG
      if (bgColor || format === 'jpeg') {
        ctx.fillStyle = bgColor || '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(canvas, 0, 0);
      return offscreen.convertToBlob({ type: mimeType, quality });
    }
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      mimeType,
      quality
    );
  });
};

const frameFileName = (index: number, ext = 'webp') => `frame_${String(index + 1).padStart(5, '0')}.${ext}`;

const getFileExtension = (format: ExportFormat): string => {
  switch (format) {
    case 'webm': return 'webm';
    case 'mov': return 'mov';
    case 'png': return 'png';
    case 'gif': return 'gif';
    case 'webp': return 'webp';
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

// Generate unique filename with dimensions and scale
const getImageFilename = (baseName: string, width: number, height: number, scale: number, ext: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${baseName}_${timestamp}_${width}x${height}_${scale}x.${ext}`;
};

// Generate unique filename for video (same format as images)
const getVideoFilename = (baseName: string, width: number, height: number, ext: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${baseName}_${timestamp}_${width}x${height}.${ext}`;
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

      const isImageExport = format === 'png' || format === 'webp';
      const isVideoExport = !isImageExport;

      // For video export, require a minimum duration
      if (isVideoExport && durationMs < 100) {
        const error = 'Video export requires a duration. Add clips to the timeline first.';
        console.error('[Render]', error);
        setState((prev) => ({ ...prev, error }));
        setRenderStatus({ error });
        return;
      }

      // WebP uses transparency like PNG
      const useTransparency = format === 'png' || format === 'webp';

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Listen for cancel event from UI
      const cancelHandler = () => {
        console.log('[Render] Cancel requested via event');
        abortController.abort();
      };
      window.addEventListener('cancel-render', cancelHandler);

      const cleanup = () => {
        window.removeEventListener('cancel-render', cancelHandler);
      };

      const totalFrames = isImageExport ? 1 : Math.max(1, Math.ceil((durationMs / 1000) * fps));
      console.log('[Render] Total frames:', totalFrames);

      // Use canvas dimensions from store for output size
      const outputWidth = canvasWidth || 1080;
      const outputHeight = canvasHeight || 1080;
      const nodeRect = node.getBoundingClientRect();
      console.log('[Render] Output size:', outputWidth, 'x', outputHeight);

      // Setup folders
      const exportFolder = await getExportFolder();
      const ext = getFileExtension(format);

      // Video: setup temp folder and output path
      let framesDir = '';
      let outputPath = '';
      if (isVideoExport) {
        framesDir = await join(exportFolder, `temp_frames_${Date.now()}`);
        await mkdir(framesDir, { recursive: true });
        const filename = getVideoFilename(outputName, outputWidth, outputHeight, ext);
        outputPath = await join(exportFolder, filename);
        console.log('[Render] Frames dir:', framesDir);
        console.log('[Render] Output path:', outputPath);
      }

      // Pause playback
      useTimelineStore.getState().setIsPlaying(false);

      setState({
        isRendering: true,
        progress: 0,
        totalFrames,
        currentFrame: 0,
        framesDir: framesDir || undefined,
        outputPath: outputPath || undefined,
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
        pixelRatio: 1, // Will be overridden per export
        cacheBust: false, // Disabled - breaks blob URLs in WebKit
        skipAutoScale: true,
        includeQueryParams: false, // Don't add query params to URLs
        skipFonts: false,
        preferredFontFormat: 'woff2' as const,
        // Ensure proper rendering of shadows and transforms
        // For PNG/WebP: make background transparent
        style: useTransparency ? {
          transformStyle: 'preserve-3d',
          backgroundColor: 'transparent',
        } : {
          transformStyle: 'preserve-3d',
        },
        // Use foreignObject for better shadow/transform support
        useForeignObjectRendering: false,
      };

      try {
        // Image Export (PNG/WebP) - export both 1x and 2x versions
        if (isImageExport) {
          console.log(`[Render] ${format.toUpperCase()} export - capturing 1x and 2x versions`);
          // Force DOM to settle with longer wait
          await waitForRender(150);

          const blobFormat = format === 'webp' ? 'webp' : 'png';

          // Export 1x version
          const ratio1x = Math.max(outputWidth / nodeRect.width, outputHeight / nodeRect.height);
          const options1x = { ...captureOptions, pixelRatio: ratio1x };
          const canvas1x = await toCanvas(node, options1x);
          const blob1x = await canvasToBlob(canvas1x, blobFormat);
          const filename1x = getImageFilename(outputName, outputWidth, outputHeight, 1, ext);
          const path1x = await join(exportFolder, filename1x);
          await writeFile(path1x, new Uint8Array(await blob1x.arrayBuffer()));
          console.log(`[Render] 1x saved:`, filename1x, blob1x.size, 'bytes');

          setRenderStatus({ progress: 0.5 });

          // Export 2x version
          const width2x = outputWidth * 2;
          const height2x = outputHeight * 2;
          const ratio2x = Math.max(width2x / nodeRect.width, height2x / nodeRect.height);
          const options2x = { ...captureOptions, pixelRatio: ratio2x };
          const canvas2x = await toCanvas(node, options2x);
          const blob2x = await canvasToBlob(canvas2x, blobFormat);
          const filename2x = getImageFilename(outputName, width2x, height2x, 2, ext);
          const path2x = await join(exportFolder, filename2x);
          await writeFile(path2x, new Uint8Array(await blob2x.arrayBuffer()));
          console.log(`[Render] 2x saved:`, filename2x, blob2x.size, 'bytes');

          setState((prev) => ({ ...prev, isRendering: false, progress: 1, outputPath: path2x }));
          setRenderStatus({ isRendering: false, progress: 1, phase: 'done' });

          await open(exportFolder);
          return;
        }

        // Video Export - capture all frames
        console.log('[Render] Video export - capturing', totalFrames, 'frames');

        // Calculate video pixelRatio (1x, no retina needed for video)
        const videoRatio = Math.max(outputWidth / nodeRect.width, outputHeight / nodeRect.height);
        const videoOptions = { ...captureOptions, pixelRatio: videoRatio };

        // Seek to start with longer initial wait
        seekTimeline(0);
        pauseAndSeekAnimations(node, 0);
        await seekVideos(node, 0);
        await waitForRender(800); // Longer wait for initial frame to ensure DOM settles and images load

        // Warmup capture to ensure lazy-loaded resources (like background images) are ready in the clone
        console.log('[Render] Warming up capture engine...');
        try {
          await toCanvas(node, videoOptions);
        } catch (e) {
          console.warn('[Render] Warmup failed (non-fatal):', e);
        }

        const writeQueue = createQueue(10);
        const writePromises: Promise<void>[] = [];

        // Calculate frame wait time based on complexity
        // More time = more reliable, but slower
        const frameWaitMs = 80; // 80ms per frame ensures DOM fully settles

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
          // Seek and sync any video elements
          await seekVideos(node, t);
          // Wait for DOM to fully update (works in background too)
          await waitForRender(frameWaitMs);

          // Capture to canvas
          const canvas = await toCanvas(node, videoOptions);

          // Convert to blob (PNG - reliable for video encoding)
          const blob = await canvasToBlob(canvas, 'png');

          // Queue disk write (parallel I/O)
          const frameNum = frameIndex;
          writePromises.push(
            writeQueue(async () => {
              const bytes = new Uint8Array(await blob.arrayBuffer());
              const filePath = await join(framesDir, frameFileName(frameNum, 'png'));
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
