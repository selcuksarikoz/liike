import { useEffect, useRef, useCallback } from 'react';
import { useTimelineStore } from '../store/timelineStore';
import { useRenderStore } from '../store/renderStore';

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

// Calculate animation values based on progress and animation type
export const calculateAnimationValue = (
  animationType: string,
  progress: number,
  intensity: number = 1,
  easing: string = 'ease-in-out'
): { transform: string; opacity?: number } => {
  // Apply easing
  let easedProgress = progress;
  switch (easing) {
    case 'ease-in':
      easedProgress = progress * progress;
      break;
    case 'ease-out':
      easedProgress = 1 - (1 - progress) * (1 - progress);
      break;
    case 'ease-in-out':
      easedProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      break;
    case 'linear':
    default:
      easedProgress = progress;
  }

  // For looping animations, use sin wave
  const loopProgress = Math.sin(easedProgress * Math.PI * 2);
  const halfLoopProgress = Math.sin(easedProgress * Math.PI);

  switch (animationType) {
    case 'float':
      return {
        transform: `translateY(${loopProgress * intensity * -1}px)`,
      };

    case 'bounce':
      const bounceY = Math.abs(Math.sin(easedProgress * Math.PI * 4)) * intensity;
      return {
        transform: `translateY(${-bounceY}px)`,
      };

    case 'rotate':
      return {
        transform: `rotateY(${easedProgress * intensity}deg)`,
      };

    case 'zoom-in':
    case 'zoom':
      const scale = 1 + halfLoopProgress * (intensity - 1);
      return {
        transform: `scale(${scale})`,
      };

    case 'zoom-out':
      const scaleOut = 1 - halfLoopProgress * (1 - 1 / intensity);
      return {
        transform: `scale(${scaleOut})`,
      };

    case 'slide-right':
    case 'slide':
      const slideX = (1 - easedProgress) * intensity;
      return {
        transform: `translateX(${slideX}px)`,
        opacity: easedProgress,
      };

    case 'slide-left':
      const slideXLeft = (easedProgress - 1) * intensity;
      return {
        transform: `translateX(${slideXLeft}px)`,
        opacity: easedProgress,
      };

    case 'slide-up':
      const slideYUp = (1 - easedProgress) * intensity;
      return {
        transform: `translateY(${slideYUp}px)`,
        opacity: easedProgress,
      };

    case 'slide-down':
      const slideYDown = (easedProgress - 1) * intensity;
      return {
        transform: `translateY(${slideYDown}px)`,
        opacity: easedProgress,
      };

    case 'zoom-up':
      const zoomUpScale = 0.7 + easedProgress * 0.3;
      const zoomUpY = (1 - easedProgress) * 30;
      return {
        transform: `scale(${zoomUpScale}) translateY(${zoomUpY}px)`,
        opacity: easedProgress,
      };

    case 'zoom-down':
      const zoomDownScale = 0.7 + easedProgress * 0.3;
      const zoomDownY = (easedProgress - 1) * 30;
      return {
        transform: `scale(${zoomDownScale}) translateY(${zoomDownY}px)`,
        opacity: easedProgress,
      };

    case 'pulse':
      const pulseScale = 1 + Math.sin(easedProgress * Math.PI * 4) * (intensity - 1) * 0.5;
      return {
        transform: `scale(${pulseScale})`,
      };

    case 'shake':
      const shakeX = Math.sin(easedProgress * Math.PI * 20) * intensity;
      return {
        transform: `translateX(${shakeX}px)`,
      };

    case 'swing':
      const swingAngle = loopProgress * intensity;
      return {
        transform: `rotate(${swingAngle}deg)`,
      };

    case 'flip':
      return {
        transform: `rotateY(${halfLoopProgress * 180}deg)`,
      };

    case 'spiral':
      const spiralScale = easedProgress;
      const spiralRotation = (1 - easedProgress) * -intensity;
      return {
        transform: `scale(${spiralScale}) rotate(${spiralRotation}deg)`,
        opacity: easedProgress,
      };

    case 'fan':
      const fanRotation = (1 - easedProgress) * -intensity;
      const fanScale = 0.5 + easedProgress * 0.5;
      return {
        transform: `rotate(${fanRotation}deg) scale(${fanScale})`,
        opacity: easedProgress,
      };

    case 'domino':
      const dominoRotateX = (1 - easedProgress) * -90;
      const dominoY = (1 - easedProgress) * -20;
      return {
        transform: `perspective(500px) rotateX(${dominoRotateX}deg) translateY(${dominoY}px)`,
        opacity: easedProgress,
      };

    default:
      return { transform: 'none' };
  }
};

// Combine multiple animation transforms
export const combineAnimations = (
  animations: { type: string; intensity?: number }[],
  progress: number,
  easing: string
): { transform: string; opacity?: number } => {
  const transforms: string[] = [];
  let opacity: number | undefined;

  animations.forEach((anim) => {
    const result = calculateAnimationValue(
      anim.type,
      progress,
      anim.intensity || getDefaultIntensity(anim.type),
      easing
    );

    if (result.transform !== 'none') {
      transforms.push(result.transform);
    }
    if (result.opacity !== undefined) {
      opacity = result.opacity;
    }
  });

  return {
    transform: transforms.length > 0 ? transforms.join(' ') : 'none',
    opacity,
  };
};

const getDefaultIntensity = (type: string): number => {
  switch (type) {
    case 'float': return 15;
    case 'bounce': return 20;
    case 'rotate': return 360;
    case 'zoom':
    case 'zoom-in': return 1.2;
    case 'zoom-out': return 1.3;
    case 'zoom-up':
    case 'zoom-down': return 1.1;
    case 'slide':
    case 'slide-right':
    case 'slide-left': return 100;
    case 'slide-up':
    case 'slide-down': return 60;
    case 'pulse': return 1.1;
    case 'shake': return 5;
    case 'swing': return 15;
    case 'flip': return 180;
    case 'spiral': return 360;
    case 'fan': return 30;
    case 'domino': return 15;
    default: return 1;
  }
};
