import { useEffect, useRef, useCallback } from 'react';
import { useTimelineStore } from '../store/timelineStore';
import { useRenderStore } from '../store/renderStore';
// Re-export animation utilities from centralized file
export { calculateAnimationValue, combineAnimations, getDefaultIntensity } from '../constants/animations';

export type ActiveAnimation = {
  clipId: string;
  type: string;
  progress: number; // 0-1 progress within the clip
  animations: string[];
  intensity?: number;
  easing: string;
};

export const useTimelinePlayback = () => {
  const {
    playheadMs,
    isPlaying,
    tracks,
    setPlayhead,
    setIsPlaying,
  } = useTimelineStore();

  const { durationMs } = useRenderStore();

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Get active clips at current playhead position
  const getActiveClips = useCallback(() => {
    const active: ActiveAnimation[] = [];

    tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        if (playheadMs >= clip.startMs && playheadMs < clip.startMs + clip.durationMs) {
          const clipProgress = (playheadMs - clip.startMs) / clip.durationMs;
          const preset = clip.data?.animationPreset;

          if (preset) {
            active.push({
              clipId: clip.id,
              type: clip.type,
              progress: clipProgress,
              animations: preset.animations || [],
              intensity: undefined, // Will be calculated per animation
              easing: preset.easing || 'ease-in-out',
            });
          }
        }
      });
    });

    return active;
  }, [tracks, playheadMs]);

  // Playback loop
  const tick = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const deltaMs = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    const newPlayhead = playheadMs + deltaMs;

    if (newPlayhead >= durationMs) {
      // Loop back to start or stop
      setPlayhead(0);
      setIsPlaying(false);
    } else {
      setPlayhead(newPlayhead);
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [playheadMs, durationMs, isPlaying, setPlayhead, setIsPlaying]);

  // Start/stop playback
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, tick]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, [setIsPlaying]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setPlayhead(0);
  }, [setIsPlaying, setPlayhead]);

  const seek = useCallback((ms: number) => {
    setPlayhead(Math.max(0, Math.min(ms, durationMs)));
  }, [setPlayhead, durationMs]);

  return {
    playheadMs,
    isPlaying,
    durationMs,
    activeClips: getActiveClips(),
    play,
    pause,
    stop,
    seek,
  };
};

