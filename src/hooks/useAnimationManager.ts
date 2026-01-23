import { useCallback } from 'react';
import { useRenderStore, type ImageLayout } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import type { LayoutPreset } from '../constants/styles';
import type { TextDevicePreset } from '../constants/textAnimations';
import { loadGoogleFont } from './useFontLoader';

type DevicePosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

const getDevicePosition = (layout: TextDevicePreset['layout']): DevicePosition => {
  switch (layout) {
    case 'text-top-device-bottom':
      return 'bottom';
    case 'text-bottom-device-top':
      return 'top';
    case 'text-left-device-right':
      return 'right';
    case 'text-right-device-left':
      return 'left';
    default:
      return 'center';
  }
};

const getDeviceAnimation = (
  textAnimation: string,
  devicePosition: DevicePosition
): string => {
  switch (textAnimation) {
    case 'blur':
    case 'zoom-blur':
      return 'zoom-in';
    case 'bounce':
    case 'elastic':
      return 'bounce-in';
    case 'flip':
      return 'flip-up';
    case 'glitch':
      return Math.random() > 0.5 ? 'zoom-out' : 'rotate-in';
    case 'wave':
      return 'rise';
    case 'typewriter':
      return 'fade';
    case 'scale':
      return 'zoom-in';
    case 'slide-up':
      return devicePosition === 'bottom' ? 'peek-bottom' : 'rise';
    case 'slide-down':
      return 'drop';
    default:
      return 'rise';
  }
};

export const useAnimationManager = () => {
  const { applyPreset, setTextOverlay, setDurationMs } = useRenderStore();
  const { addClip, clearTrack, setPlayhead, setIsPlaying } = useTimelineStore();

  const clearAnimations = useCallback(() => {
    setIsPlaying(false);
    setPlayhead(0);
    clearTrack('track-animation');
    setTextOverlay({ enabled: false });
  }, [clearTrack, setPlayhead, setIsPlaying, setTextOverlay]);

  const applyLayoutAnimation = useCallback(
    (preset: LayoutPreset, layout: ImageLayout) => {
      // Clear everything first
      clearAnimations();

      // Apply layout preset
      applyPreset({
        rotationX: preset.rotationX,
        rotationY: preset.rotationY,
        rotationZ: preset.rotationZ,
        imageLayout: layout,
      });

      // Add animation clip if preset has animations
      const hasAnimation = preset.animations.some((a) => a.type !== 'none');
      if (hasAnimation) {
        setDurationMs(preset.durationMs);
        addClip('track-animation', {
          trackId: 'track-animation',
          type: 'animation',
          name: preset.name,
          startMs: 0,
          durationMs: preset.durationMs,
          color: preset.color,
          icon: preset.icon,
          data: {
            animationPreset: {
              id: preset.id,
              name: preset.name,
              animations: preset.animations.map((a) => a.type).filter((t) => t !== 'none') as any[],
              icon: preset.icon,
              color: preset.color,
              duration: preset.durationMs,
              easing: preset.animations[0]?.easing || 'ease-in-out',
            },
          },
        });
        setTimeout(() => setIsPlaying(true), 100);
      }
    },
    [applyPreset, clearAnimations, setDurationMs, addClip, setIsPlaying]
  );

  const applyTextAnimation = useCallback(
    (preset: TextDevicePreset) => {
      // Clear everything first
      clearAnimations();

      // Load font
      loadGoogleFont('Manrope');

      // Calculate device position and animation
      const devicePosition = getDevicePosition(preset.layout);
      const deviceAnimation = getDeviceAnimation(preset.textAnimation, devicePosition);

      // Set text overlay
      setTextOverlay({
        enabled: true,
        text: `${preset.headline}\n${preset.tagline}`,
        headline: preset.headline,
        tagline: preset.tagline,
        fontFamily: 'Manrope',
        animation: preset.textAnimation,
        position: preset.textPosition,
        layout: preset.layout,
        fontSize: preset.headlineFontSize,
        taglineFontSize: preset.taglineFontSize,
        color: preset.color,
        deviceOffset: preset.deviceOffset ?? -20,
        devicePosition,
        deviceAnimateIn: true,
        deviceAnimation,
      });

      // Set duration and add clip
      setDurationMs(preset.durationMs);
      addClip('track-animation', {
        trackId: 'track-animation',
        type: 'animation',
        name: preset.name,
        startMs: 0,
        durationMs: preset.durationMs,
        color: preset.color,
        icon: preset.icon,
        data: {
          animationPreset: {
            id: preset.id,
            name: preset.name,
            animations: [preset.textAnimation as any],
            icon: preset.icon,
            color: preset.color,
            duration: preset.durationMs,
            easing: 'ease-out',
          },
        },
      });
      setTimeout(() => setIsPlaying(true), 100);
    },
    [clearAnimations, setTextOverlay, setDurationMs, addClip, setIsPlaying]
  );

  return {
    clearAnimations,
    applyLayoutAnimation,
    applyTextAnimation,
  };
};
