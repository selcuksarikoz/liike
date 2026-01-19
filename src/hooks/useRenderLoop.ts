import { useCallback, useMemo, useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import { mkdir, writeFile } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { join, tempDir } from '@tauri-apps/api/path';

export type RenderOptions = {
  node: HTMLElement | null;
  durationMs: number;
  fps?: number;
  outputName?: string;
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

export const useRenderLoop = () => {
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
  }, []);

  const saveFrame = useCallback(
    async (framesDir: string, index: number, node: HTMLElement) => {
      const blob = await toBlob(node, { pixelRatio: 1 });
      if (!blob) {
        throw new Error('Failed to capture frame.');
      }

      const bytes = await blobToUint8Array(blob);
      const filePath = await join(framesDir, frameFileName(index));

      await writeFile(filePath, bytes);
    },
    []
  );

  const render = useCallback(
    async ({ node, durationMs, fps = 30, outputName = 'liike_render' }: RenderOptions) => {
      if (!node) {
        setState((prev) => ({ ...prev, error: 'Missing node to render.' }));
        return;
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const totalFrames = Math.max(1, Math.ceil((durationMs / 1000) * fps));
      const tempRoot = await tempDir();
      const framesDir = await join(tempRoot, `liike_frames_${Date.now()}`);
      const outputPath = await join(tempRoot, `${outputName}.mp4`);

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

      try {
        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
          if (abortController.signal.aborted) {
            resetState();
            return;
          }

          const t = (frameIndex / fps) * 1000;
          pauseAndSeekAnimations(node, t);
          await saveFrame(framesDir, frameIndex, node);

          setState((prev) => ({
            ...prev,
            currentFrame: frameIndex + 1,
            progress: (frameIndex + 1) / totalFrames,
          }));
        }
      } catch (error) {
        setState((prev) => ({ ...prev, error: (error as Error).message, isRendering: false }));
        return;
      }

      try {
        unlistenProgressRef.current = await listen<{ progress: number }>(
          'encode-video-progress',
          (event) => {
            const next = Math.min(1, event.payload.progress);
            setState((prev) => ({ ...prev, progress: next }));
          }
        );

        await invoke('encode_video', {
          framesDir,
          outputPath,
          fps,
        });

        setState((prev) => ({ ...prev, isRendering: false, progress: 1 }));
      } catch (error) {
        setState((prev) => ({ ...prev, error: (error as Error).message, isRendering: false }));
      } finally {
        if (unlistenProgressRef.current) {
          unlistenProgressRef.current();
          unlistenProgressRef.current = null;
        }
      }
    },
    [resetState, saveFrame]
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    if (unlistenProgressRef.current) {
      unlistenProgressRef.current();
      unlistenProgressRef.current = null;
    }
    resetState();
  }, [resetState]);

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
