import { useCallback, useMemo, useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import { mkdir, writeFile, remove } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { join, tempDir, downloadDir } from '@tauri-apps/api/path';
import { save } from '@tauri-apps/plugin-dialog';
import { useRenderStore, type ExportFormat } from '../store/renderStore';

export type RenderOptions = {
  node: HTMLElement | null;
  durationMs: number;
  fps?: number;
  outputName?: string;
  format?: ExportFormat;
  width?: number;
  height?: number;
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

const blobToUint8Array = async (blob: Blob): Promise<Uint8Array> => {
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
};

const pauseAndSeekAnimations = (node: HTMLElement, timeMs: number) => {
  const animations = node.getAnimations({ subtree: true });
  animations.forEach((animation) => {
    animation.pause();
    animation.currentTime = timeMs;
  });
};

const frameFileName = (index: number) => `frame_${String(index + 1).padStart(3, '0')}.png`;

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

const getFileFilter = (format: ExportFormat): { name: string; extensions: string[] } => {
  switch (format) {
    case 'webm': return { name: 'WebM Video', extensions: ['webm'] };
    case 'mov': return { name: 'QuickTime Movie', extensions: ['mov'] };
    case 'png': return { name: 'PNG Image', extensions: ['png'] };
    case 'gif': return { name: 'GIF Animation', extensions: ['gif'] };
    case 'mp4':
    default: return { name: 'MP4 Video', extensions: ['mp4'] };
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createQueue = (concurrency: number) => {
  let active = 0;
  const queue: (() => Promise<void>)[] = [];
  const next = () => {
    if (active >= concurrency || queue.length === 0) return;
    active++;
    const fn = queue.shift()!;
    fn().finally(() => {
      active--;
      next();
    });
  };
  return (fn: () => Promise<void>) => {
    return new Promise<void>((resolve, reject) => {
      queue.push(() => fn().then(resolve, reject));
      next();
    });
  };
};

const cleanupTempFiles = async (framesDir: string, tempOutputPath: string) => {
  try {
    // Remove frames directory
    await invoke('cleanup_temp_dir', { dirPath: framesDir });
  } catch (e) {
    console.warn('Failed to cleanup frames dir:', e);
  }
  try {
    // Remove temp output file
    await remove(tempOutputPath);
  } catch (e) {
    console.warn('Failed to cleanup temp output:', e);
  }
};

export const useRenderLoop = () => {
  const { setRenderStatus, resetRenderStatus } = useRenderStore();
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



  // Helper to write frame to disk
  const writeFrame = useCallback(
    async (framesDir: string, index: number, blob: Blob) => {
      const bytes = await blobToUint8Array(blob);
      const filePath = await join(framesDir, frameFileName(index));
      await writeFile(filePath, bytes);
    },
    []
  );

  const render = useCallback(
    async ({ node, durationMs, fps = 30, outputName = 'liike_render', format = 'mp4', width, height }: RenderOptions) => {
      if (!node) {
        setState((prev) => ({ ...prev, error: 'Missing node to render.' }));
        setRenderStatus({ error: 'Missing node to render.' });
        return;
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // For PNG export, only capture one frame
      const isPngExport = format === 'png';
      const totalFrames = isPngExport ? 1 : Math.max(1, Math.ceil((durationMs / 1000) * fps));
      const tempRoot = await tempDir();
      const framesDir = await join(tempRoot, `liike_frames_${Date.now()}`);
      const ext = getFileExtension(format);
      const outputPath = await join(tempRoot, `${outputName}.${ext}`);

      await mkdir(framesDir, { recursive: true });

      pauseAndSeekAnimations(node, 0);

      setState({
        isRendering: true,
        progress: 0,
        totalFrames,
        currentFrame: 0,
        framesDir,
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


      try {
        const queueLimit = createQueue(5); // 5 concurrent writes
        const writePromises: Promise<void>[] = [];

        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
          // Check abort at start of loop
          if (abortController.signal.aborted) {
            resetState();
            return;
          }

          // Yield to main thread to allow UI updates
          await sleep(0);

          const t = (frameIndex / fps) * 1000;
          pauseAndSeekAnimations(node, t);
          
          // Capture frame (must be sequential with DOM state)
          const blob = await toBlob(node, { pixelRatio: 1 });
          if (!blob) {
            throw new Error('Failed to capture frame.');
          }

          // Queue the write operation (parallel)
          const p = queueLimit(() => writeFrame(framesDir, frameIndex, blob));
          writePromises.push(p);

          // Update progress
          setState((prev) => ({
            ...prev,
            currentFrame: frameIndex + 1,
            progress: (frameIndex + 1) / totalFrames,
          }));
          setRenderStatus({
            currentFrame: frameIndex + 1,
            progress: (frameIndex + 1) / totalFrames,
          });
        }
        
        // Wait for all writes to complete
        await Promise.all(writePromises);
        
      } catch (error) {
        const errorMsg = (error as Error).message;
        setState((prev) => ({ ...prev, error: errorMsg, isRendering: false }));
        setRenderStatus({ error: errorMsg, isRendering: false, phase: 'idle' });
        return;
      }

      // For PNG, just copy the first frame to output
      if (isPngExport) {
        try {
          const framePath = await join(framesDir, frameFileName(0));
          // Copy frame to temp output path
          await invoke('copy_file', { src: framePath, dest: outputPath });

          // Ask user where to save
          const defaultPath = await join(await downloadDir(), `${outputName}.${ext}`);
          const savePath = await save({
            defaultPath,
            filters: [getFileFilter(format)],
            title: 'Save Export',
          });

          if (savePath) {
            // Copy to user's selected location
            await invoke('copy_file', { src: outputPath, dest: savePath });
            setState((prev) => ({ ...prev, isRendering: false, progress: 1, outputPath: savePath }));
            setRenderStatus({ isRendering: false, progress: 1, phase: 'done' });
          } else {
            // User cancelled
            setState((prev) => ({ ...prev, isRendering: false, progress: 1 }));
            setRenderStatus({ isRendering: false, progress: 1, phase: 'idle' });
          }

          // Cleanup temp files
          await cleanupTempFiles(framesDir, outputPath);
        } catch (error) {
          const errorMsg = (error as Error).message;
          setState((prev) => ({ ...prev, error: errorMsg, isRendering: false }));
          setRenderStatus({ error: errorMsg, isRendering: false, phase: 'idle' });
          // Still try to cleanup on error
          await cleanupTempFiles(framesDir, outputPath);
        }
        return;
      }

      // Video encoding
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
          width: width || 1080,
          height: height || 1080,
        });

        // Ask user where to save
        const defaultPath = await join(await downloadDir(), `${outputName}.${ext}`);
        const savePath = await save({
          defaultPath,
          filters: [getFileFilter(format)],
          title: 'Save Export',
        });

        if (savePath) {
          // Copy to user's selected location
          await invoke('copy_file', { src: outputPath, dest: savePath });
          setState((prev) => ({ ...prev, isRendering: false, progress: 1, outputPath: savePath }));
          setRenderStatus({ isRendering: false, progress: 1, phase: 'done' });
        } else {
          // User cancelled
          setState((prev) => ({ ...prev, isRendering: false, progress: 1 }));
          setRenderStatus({ isRendering: false, progress: 1, phase: 'idle' });
        }

        // Cleanup temp files
        await cleanupTempFiles(framesDir, outputPath);
      } catch (error) {
        const errorMsg = (error as Error).message;
        setState((prev) => ({ ...prev, error: errorMsg, isRendering: false }));
        setRenderStatus({ error: errorMsg, isRendering: false, phase: 'idle' });
        // Still try to cleanup on error
        await cleanupTempFiles(framesDir, outputPath);
      } finally {
        if (unlistenProgressRef.current) {
          unlistenProgressRef.current();
          unlistenProgressRef.current = null;
        }
      }
    },
    [resetState, writeFrame, setRenderStatus]
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

  const api = useMemo(
    () => ({
      render,
      cancel,
      state,
    }),
    [cancel, render, state]
  );

  return api;
};

export type RenderLoopApi = ReturnType<typeof useRenderLoop>;
