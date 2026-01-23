import { useCallback, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { join } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-shell';
import { useRenderStore } from '../store/renderStore';
import type { ExportFormat } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import {
  getExportFolder,
  getVideoFilename,
  getFileExtension,
  seekTimeline,
  pauseAndSeekAnimations,
  pauseAndSeekVideos,
  waitForRender,
  preloadResources,
  preloadFonts,
  captureFrame,
  arrayToBase64,
  nodeToSvgDataUrl,
  loadImage,
  renderTextOverlay,
} from '../utils/renderUtils';

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
  const { setRenderStatus, resetRenderStatus, canvasWidth, canvasHeight, renderQuality } = useRenderStore();
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

      console.log('[StreamRender] Config:', { durationMs, fps });
      
      const totalFrames = Math.max(1, Math.ceil((durationMs / 1000) * fps));
      const qualityMultiplier = renderQuality === '4k' ? 2 : 1;
      const outputWidth = (canvasWidth || 1080) * qualityMultiplier;
      const outputHeight = (canvasHeight || 1080) * qualityMultiplier;
      
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Setup output path
      const exportFolder = await getExportFolder();
      const ext = getFileExtension(format);
      
      // Image Export (PNG/WebP) - Single frame capture
      const isImageExport = format === 'png' || format === 'webp';
      if (isImageExport) {
        console.log('[StreamRender] Exporting image...');
        const filename = getVideoFilename(outputName, outputWidth, outputHeight, ext);
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
           pauseAndSeekVideos(node, playheadMs);
           await waitForRender(50); // Convert DOM to canvas needs a settled DOM

           // Preload fonts for text overlay rendering
           await preloadFonts(node);

           // Capture frame logic (Inline here because we need Blob, captureFrame returns RGBA)
           const canvas = document.createElement('canvas');
           canvas.width = outputWidth;
           canvas.height = outputHeight;
           const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: true })!;
           
           // High quality smoothing
           ctx.imageSmoothingEnabled = true;
           ctx.imageSmoothingQuality = 'high';
           
           // Background & Clipping
           const computedStyle = window.getComputedStyle(node);
           ctx.clearRect(0, 0, outputWidth, outputHeight);
           
           // Content
           const nodeRect = node.getBoundingClientRect();
           const scaleX = outputWidth / nodeRect.width;
           const scaleY = outputHeight / nodeRect.height;
           const scale = Math.min(scaleX, scaleY);
           const offsetX = (outputWidth - nodeRect.width * scale) / 2;
           const offsetY = (outputHeight - nodeRect.height * scale) / 2;

           ctx.save();
           ctx.translate(offsetX, offsetY);
           ctx.scale(scale, scale);

           // Apply clipping for rounded corners
           const radius = parseFloat(computedStyle.borderRadius) || 0;
           if (radius > 0) {
               ctx.beginPath();
               if ((ctx as any).roundRect) {
                   (ctx as any).roundRect(0, 0, nodeRect.width, nodeRect.height, radius);
               } else {
                   ctx.rect(0, 0, nodeRect.width, nodeRect.height);
               }
               ctx.clip();
           }

           // Fill background inside the clipped area
           ctx.fillStyle = computedStyle.backgroundColor || '#000000';
           ctx.fillRect(0, 0, nodeRect.width, nodeRect.height);

           const svgData = await nodeToSvgDataUrl(node, nodeRect.width, nodeRect.height);
           const img = await loadImage(svgData);
           ctx.drawImage(img, 0, 0, nodeRect.width, nodeRect.height);
           ctx.restore();

           // Render text overlay on canvas (uses Canvas 2D API for proper font rendering)
           renderTextOverlay(ctx, outputWidth, outputHeight, scale);

           // Convert to blob and write to disk
           const blob = await new Promise<Blob | null>(resolve => 
             canvas.toBlob(resolve, format === 'webp' ? 'image/webp' : 'image/png')
           );
           
           if (!blob) throw new Error('Failed to create image blob');
           
           const arrayBuffer = await blob.arrayBuffer();
           const { writeFile } = await import('@tauri-apps/plugin-fs');
           await writeFile(outputPath, new Uint8Array(arrayBuffer));
           
           console.log('[StreamRender] Image saved:', outputPath);
           setState(prev => ({ ...prev, isRendering: false, progress: 1, phase: 'done' }));
           setRenderStatus({ isRendering: false, progress: 1, phase: 'done' });
           await open(exportFolder);
           
        } catch (error) {
           const errorMsg = (error as Error).message || String(error);
           console.error('[StreamRender] Image export error:', errorMsg);
           setState(prev => ({ ...prev, error: errorMsg, isRendering: false, phase: 'idle' }));
           setRenderStatus({ error: errorMsg, isRendering: false, phase: 'idle' });
        }
        return;
      }

      if (durationMs < 100) {
        const error = 'Video export requires a duration.';
        console.error('[StreamRender]', error);
        setState((prev) => ({ ...prev, error, phase: 'idle' }));
        setRenderStatus({ error });
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
        // Start the streaming encoder in Rust
        console.log('[StreamRender] Starting streaming encoder...');
        const encoderId = await invoke<string>('start_streaming_encode', {
          outputPath,
          width: outputWidth,
          height: outputHeight,
          fps,
          totalFrames,
          format,
          useHw: true,
        });
        encoderIdRef.current = encoderId;
        console.log('[StreamRender] Encoder started:', encoderId);

        // Seek to start
        seekTimeline(0);
        pauseAndSeekAnimations(node, 0);
        pauseAndSeekVideos(node, 0);

        // Preload resources (images, videos) and fonts for text overlay
        await preloadResources(node);
        await preloadFonts(node);

        await waitForRender(50);

        // Capture and stream each frame
        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
          if (abortController.signal.aborted) {
            console.log('[StreamRender] Aborted at frame', frameIndex);
            return;
          }

          const timeMs = (frameIndex / fps) * 1000;

          if (abortController.signal.aborted) return;

          // Seek timeline
          seekTimeline(timeMs);
          pauseAndSeekAnimations(node, timeMs);
          pauseAndSeekVideos(node, timeMs);
          
          if (abortController.signal.aborted) return;

          // Wait for React to re-render and browser to compute styles
          // First frame needs more time to ensure animation state is correct
          await waitForRender(frameIndex === 0 ? 32 : 8);

          if (abortController.signal.aborted) return;

          // Capture frame to raw RGBA
          const rgbaData = await captureFrame(node, outputWidth, outputHeight);
          
          if (abortController.signal.aborted) return;
          
          // Send to Rust encoder
          const frameBase64 = arrayToBase64(rgbaData);
          const progress = await invoke<number>('send_frame', {
            encoderId,
            frameData: frameBase64,
          });

          // Update progress
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

        // Finish encoding
        console.log('[StreamRender] Finishing encoding...');
        setState((prev) => ({ ...prev, phase: 'encoding' }));
        setRenderStatus({ phase: 'encoding' });

        await invoke('finish_streaming_encode', { encoderId: encoderIdRef.current });
        encoderIdRef.current = null;

        console.log('[StreamRender] Export complete:', outputPath);
        setState((prev) => ({
          ...prev,
          isRendering: false,
          progress: 1,
          phase: 'done',
        }));
        setRenderStatus({ isRendering: false, progress: 1, phase: 'done' });

        // Open export folder
        await open(exportFolder);
      } catch (error) {
        const errorMsg = (error as Error).message || String(error);
        console.error('[StreamRender] Error:', errorMsg);
        setState((prev) => ({ ...prev, error: errorMsg, isRendering: false, phase: 'idle' }));
        setRenderStatus({ error: errorMsg, isRendering: false, phase: 'idle' });

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
    
    // 3. Clean up backend process
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
