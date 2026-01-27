import { invoke } from '@tauri-apps/api/core';
import { dirname, join } from '@tauri-apps/api/path';
import { platform } from '@tauri-apps/plugin-os';
import { Command } from '@tauri-apps/plugin-shell';
import { useCallback, useRef, useState } from 'react';
import type { ExportFormat } from '../store/renderStore';
import { useRenderStore } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import {
  captureFrame,
  clearExportContext,
  getExportFolder,
  getFileExtension,
  getVideoFilename,
  pauseAndSeekAnimations,
  pauseAndSeekVideos,
  preloadFonts,
  preloadResources,
  prepareExportContext,
  seekTimeline,
  updateExportAnimations,
  waitForRender,
  yieldToMain
} from '../utils/renderUtils';

const revealInFileManager = async (filePath: string) => {
  const os = platform();
  if (os === 'macos') {
    await Command.create('open', ['-R', filePath]).execute();
  } else if (os === 'windows') {
    await Command.create('explorer', ['/select,', filePath]).execute();
  } else {
    // Linux: xdg-open only opens folders, can't select file
    const folder = await dirname(filePath);
    await Command.create('xdg-open', [folder]).execute();
  }
};

export type StreamingRenderOptions = {
  node: HTMLElement | null;
  durationMs: number;
  fps?: number;
  outputName?: string;
  format?: ExportFormat;
};

export type StreamingRenderState = {
  isRendering: boolean;
  progress: number;
  totalFrames: number;
  currentFrame: number;
  outputPath?: string;
  error?: string;
  phase: 'idle' | 'capturing' | 'encoding' | 'done';
};

/**
 * useStreamingRender - Native Canvas based video export
 * 
 * This hook renders frames using native HTML5 Canvas API and streams them
 * directly to FFmpeg via Rust IPC.
 * 
 * Helper functions have been moved to ../utils/renderUtils.ts
 */
export const useStreamingRender = () => {
  const { setRenderStatus, resetRenderStatus, canvasWidth, canvasHeight, renderQuality, mediaAssets } = useRenderStore();
  const [state, setState] = useState<StreamingRenderState>({
    isRendering: false,
    progress: 0,
    totalFrames: 0,
    currentFrame: 0,
    phase: 'idle',
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const encoderIdRef = useRef<string | null>(null);

  const resetState = useCallback(() => {
    setState({
      isRendering: false,
      progress: 0,
      totalFrames: 0,
      currentFrame: 0,
      error: undefined,
      outputPath: undefined,
      phase: 'idle',
    });
    resetRenderStatus();
  }, [resetRenderStatus]);

  /**
   * Main render function - streaming video export
   */
  const render = useCallback(
    async ({
      node,
      durationMs,
      fps = 30,
      outputName = 'liike_export',
      format = 'mp4',
    }: StreamingRenderOptions) => {
      console.log('[StreamRender] Starting streaming export:', { format, durationMs, fps, renderQuality });

      if (!node) {
        const error = 'Missing node to render.';
        console.error('[StreamRender]', error);
        setState((prev) => ({ ...prev, error, phase: 'idle' }));
        setRenderStatus({ error });
        return;
      }

      // Calculate effective duration - VIDEO ALWAYS TAKES PRIORITY
      // Animation duration should NOT cut the video short
      const maxVideoDuration = mediaAssets.reduce((max, asset) => {
        if (asset?.type === 'video' && asset.duration) {
          return Math.max(max, asset.duration);
        }
        return max;
      }, 0);

      // If there's a video, always use video duration (don't let animation cut it)
      // If no video, use the passed durationMs (animation/timeline duration)
      const effectiveDuration = maxVideoDuration > 0 ? maxVideoDuration : durationMs;
      console.log('[StreamRender] Duration:', { video: maxVideoDuration, animation: durationMs, effective: effectiveDuration });

      console.log('[StreamRender] Config:', { durationMs: effectiveDuration, fps, maxVideoDuration });

      const totalFrames = Math.max(1, Math.ceil((effectiveDuration / 1000) * fps));
      const qualityMultiplier = renderQuality === '4k' ? 2 : 1;
      const outputWidth = (canvasWidth || 1080) * qualityMultiplier;
      const outputHeight = (canvasHeight || 1080) * qualityMultiplier;
      
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Setup output path
      const exportFolder = await getExportFolder();
      const ext = getFileExtension(format);
      
      // Image Export (PNG/WebP) or screenshot fallback if no duration
      const isImageFallback = effectiveDuration < 100;
      const isImageExport = format === 'png' || format === 'webp' || isImageFallback;

      if (isImageExport) {
        const exportFormat = isImageFallback ? 'png' : format;
        const exportExt = isImageFallback ? 'png' : ext;
        
        console.log(`[StreamRender] Exporting ${isImageFallback ? 'screenshot' : 'image'}...`);
        const filename = getVideoFilename(outputName, outputWidth, outputHeight, exportExt);
        const outputPath = await join(exportFolder, filename);

        // Setting state
        setState({
          isRendering: true,
          progress: 0,
          totalFrames: 1,
          currentFrame: 0,
          outputPath,
          error: undefined,
          phase: 'capturing',
        });
        setRenderStatus({
          isRendering: true,
          progress: 0,
          totalFrames: 1,
          currentFrame: 0,
          error: null,
          phase: 'capturing',
        });

         try {
           // Seek timeline to current playhead
           const { playheadMs } = useTimelineStore.getState();
           seekTimeline(playheadMs);
           pauseAndSeekAnimations(node, playheadMs);
           await pauseAndSeekVideos(node, playheadMs);
           await waitForRender(50); // Convert DOM to canvas needs a settled DOM

           // Preload resources (images, videos) and fonts - CRITICAL for export
           await preloadResources(node);
           await preloadFonts(node);

           // Prepare export context for correct layered rendering (Background -> Video -> Device)
           const nodeRect = node.getBoundingClientRect();
           await prepareExportContext(node, nodeRect.width, nodeRect.height, outputWidth, outputHeight);

           // captureFrame(node, outputWidth, outputHeight, DURATION, TIME)
           // Passing effectiveDuration ensures text animations match what is seen on timeline
           const rgbaData = await captureFrame(node, outputWidth, outputHeight, effectiveDuration, playheadMs);

           // Put data back onto canvas for saving
           const canvas = document.createElement('canvas');
           canvas.width = outputWidth;
           canvas.height = outputHeight;
           const ctx = canvas.getContext('2d')!;
           // TS workaround: Uint8ClampedArray mismatch
           const imageData = new ImageData(rgbaData as any, outputWidth, outputHeight);
           ctx.putImageData(imageData, 0, 0);

           // Clean up context immediately
           clearExportContext();

           // Convert to blob and write to disk
           const blob = await new Promise<Blob | null>(resolve => 
             canvas.toBlob(resolve, exportFormat === 'webp' ? 'image/webp' : 'image/png')
           );
           
           if (!blob) throw new Error('Failed to create image blob');
           
           const arrayBuffer = await blob.arrayBuffer();
           const { writeFile } = await import('@tauri-apps/plugin-fs');
           await writeFile(outputPath, new Uint8Array(arrayBuffer));
           
           console.log('[StreamRender] Image saved:', outputPath);
           setState(prev => ({ ...prev, isRendering: false, progress: 1, phase: 'done' }));
           setRenderStatus({ isRendering: false, progress: 1, phase: 'done' });
           await revealInFileManager(outputPath);
           
        } catch (error) {
           const errorMsg = (error as Error).message || String(error);
           console.error('[StreamRender] Image export error:', errorMsg);
           setState(prev => ({ ...prev, error: errorMsg, isRendering: false, phase: 'idle' }));
           setRenderStatus({ error: errorMsg, isRendering: false, phase: 'idle' });
        }
        return;
      }
      
      // Video Export Logic
      const filename = getVideoFilename(outputName, outputWidth, outputHeight, ext);
      const outputPath = await join(exportFolder, filename);

      // Pause playback
      useTimelineStore.getState().setIsPlaying(false);

      setState({
        isRendering: true,
        progress: 0,
        totalFrames,
        currentFrame: 0,
        outputPath,
        error: undefined,
        phase: 'capturing',
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
        // Get audio file from timeline if available (skip if muted)
        const { tracks } = useTimelineStore.getState();
        const audioTrack = tracks.find((t) => t.type === 'audio');
        const audioClip = audioTrack?.clips[0];
        const isAudioMuted = audioTrack?.muted ?? false;
        const audioPath = (!isAudioMuted && audioClip?.data?.mediaUrl) || null;

        // Start the streaming encoder in Rust
        console.log('[StreamRender] Starting streaming encoder...', { audioPath });
        const encoderId = await invoke<string>('start_streaming_encode', {
          outputPath,
          width: outputWidth,
          height: outputHeight,
          fps,
          totalFrames,
          format,
          useHw: true,
          audioPath,
        });
        encoderIdRef.current = encoderId;
        console.log('[StreamRender] Encoder started:', encoderId);

        // Seek to start
        seekTimeline(0);
        pauseAndSeekAnimations(node, 0);
        await pauseAndSeekVideos(node, 0);

        // CRITICAL: Yield to allow React to re-render with playhead=0
        // This ensures initial animation states (opacity=0, etc.) are applied before cloning
        await yieldToMain();
        await waitForRender(16); // Extra frame for React to settle

        // Preload resources (images, videos) and fonts for text overlay
        await preloadResources(node);
        await preloadFonts(node);

        // Prepare export context ONCE before frame loop (major perf optimization)
        const nodeRect = node.getBoundingClientRect();
        await prepareExportContext(node, nodeRect.width, nodeRect.height, outputWidth, outputHeight);

        await waitForRender(50);

        // Capture and stream each frame with improved threading
        const hasVideos = node.querySelectorAll('video').length > 0;
        console.log(`[StreamRender] Starting frame loop: ${totalFrames} frames, hasVideos: ${hasVideos}`);
        const loopStart = performance.now();

        // Batch size for yielding - process multiple frames before yielding
        // This improves throughput while still allowing UI updates
        const BATCH_SIZE = 3;

        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
          if (abortController.signal.aborted) {
            console.log('[StreamRender] Aborted at frame', frameIndex);
            clearExportContext();
            return;
          }

          const timeMs = (frameIndex / fps) * 1000;

          // Direct-Drive Animation Loop
          // We do NOT update React state or seek the timeline here.
          // We manually drive the cloned DOM elements using `updateExportAnimations`.

          updateExportAnimations(timeMs, effectiveDuration);

          // Only sync videos (they are native elements)
          if (hasVideos) {
            await pauseAndSeekVideos(node, timeMs);
          }

          if (abortController.signal.aborted) {
            clearExportContext();
            return;
          }

          // Capture frame to raw RGBA (high quality)
          const rgbaData = await captureFrame(node, outputWidth, outputHeight, effectiveDuration, timeMs);

          if (abortController.signal.aborted) {
            clearExportContext();
            return;
          }

          // Send to Rust encoder (Uint8Array serializes properly, Uint8ClampedArray doesn't)
          const progress = await invoke<number>('send_frame', {
            encoderId,
            frameData: new Uint8Array(rgbaData.buffer),
          });

          // Update progress - every frame for accurate progress tracking
          // But batch React state updates for performance
          const shouldUpdateUI = frameIndex % BATCH_SIZE === 0 || frameIndex === totalFrames - 1;
          if (shouldUpdateUI) {
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

          // Yield to main thread periodically to prevent UI freezing
          // Use requestAnimationFrame for smoother yielding when possible
          if (shouldUpdateUI) {
            await new Promise<void>(resolve => {
              if (typeof requestAnimationFrame !== 'undefined') {
                requestAnimationFrame(() => {
                  setTimeout(resolve, 0);
                });
              } else {
                setTimeout(resolve, 0);
              }
            });
          }
        }

        console.log(`[StreamRender] Frame loop completed in ${((performance.now() - loopStart) / 1000).toFixed(1)}s`);

        // Finish encoding
        console.log('[StreamRender] Finishing encoding...');
        setState((prev) => ({ ...prev, phase: 'encoding' }));
        setRenderStatus({ phase: 'encoding' });

        await invoke('finish_streaming_encode', { encoderId: encoderIdRef.current });
        encoderIdRef.current = null;

        // Clear export context
        clearExportContext();

        console.log('[StreamRender] Export complete:', outputPath);
        setState((prev) => ({
          ...prev,
          isRendering: false,
          progress: 1,
          phase: 'done',
        }));
        setRenderStatus({ isRendering: false, progress: 1, phase: 'done' });

        // Reveal exported file in Finder
        await revealInFileManager(outputPath);
      } catch (error) {
        const errorMsg = (error as Error).message || String(error);
        console.error('[StreamRender] Error:', errorMsg);
        setState((prev) => ({ ...prev, error: errorMsg, isRendering: false, phase: 'idle' }));
        setRenderStatus({ error: errorMsg, isRendering: false, phase: 'idle' });

        // Clean up export context
        clearExportContext();

        // Cleanup encoder if needed
        if (encoderIdRef.current) {
          try {
            await invoke('cancel_streaming_encode', { encoderId: encoderIdRef.current });
          } catch {
            // Ignore cleanup errors
          }
          encoderIdRef.current = null;
        }
      }
    },
    [resetState, setRenderStatus, canvasWidth, canvasHeight, renderQuality]
  );

  const cancel = useCallback(async () => {
    // 1. Stop playback & signal abort immediately
    const store = useTimelineStore.getState();
    store.setIsPlaying(false);
    store.setPlayhead(0); // Reset to start
    abortControllerRef.current?.abort();

    // 2. Reset UI state immediately
    resetState();
    resetRenderStatus();

    // 3. Clean up export context
    clearExportContext();

    // 4. Clean up backend process
    if (encoderIdRef.current) {
      const encoderId = encoderIdRef.current;
      encoderIdRef.current = null;
      try {
        await invoke('cancel_streaming_encode', { encoderId });
      } catch (e) {
        console.warn('[StreamRender] Cancel error:', e);
      }
    }
  }, [resetState, resetRenderStatus]);

  return { render, cancel, state };
};

export type StreamingRenderApi = ReturnType<typeof useStreamingRender>;
