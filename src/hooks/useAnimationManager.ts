import { useCallback } from 'react';
import { useRenderStore, type ImageLayout } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import { DEFAULT_DEVICE_CONFIG, type LayoutPreset, type DevicePosition, type DeviceConfig } from '../constants/layoutAnimationPresets';
import type { TextDevicePreset } from '../constants/textAnimations';
import { loadGoogleFont } from './useFontLoader';

// Device position presets for text layouts
const TEXT_LAYOUT_DEVICE_CONFIGS: Record<string, Partial<DeviceConfig>> = {
  'text-top-device-bottom': { position: 'bottom', scale: 0.75, offsetX: 0, offsetY: 20, animation: 'rise', animateIn: true },
  'text-bottom-device-top': { position: 'top', scale: 0.75, offsetX: 0, offsetY: -20, animation: 'drop', animateIn: true },
  'text-left-device-right': { position: 'right', scale: 0.8, offsetX: 25, offsetY: 0, animation: 'slide-right', animateIn: true },
  'text-right-device-left': { position: 'left', scale: 0.8, offsetX: -25, offsetY: 0, animation: 'slide-left', animateIn: true },
  'text-center-device-behind': { position: 'center', scale: 0.9, offsetX: 0, offsetY: 0, animation: 'zoom-in', animateIn: true },
};

// Get device animation based on text animation type
const getDeviceAnimation = (textAnimation: string, baseAnimation: string): string => {
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
    default:
      return baseAnimation;
  }
};

export const useAnimationManager = () => {
  const { applyPreset, setTextOverlay, setDurationMs } = useRenderStore();
  const { addClip, clearTrack, setPlayhead, setIsPlaying } = useTimelineStore();

  const clearAnimations = useCallback(() => {
    setIsPlaying(false);
    setPlayhead(0);
    clearTrack('track-animation');
    setTextOverlay({
      enabled: false,
      devicePosition: DEFAULT_DEVICE_CONFIG.position,
      deviceScale: DEFAULT_DEVICE_CONFIG.scale,
      deviceOffsetX: DEFAULT_DEVICE_CONFIG.offsetX,
      deviceOffsetY: DEFAULT_DEVICE_CONFIG.offsetY,
      deviceAnimateIn: DEFAULT_DEVICE_CONFIG.animateIn,
      deviceAnimation: DEFAULT_DEVICE_CONFIG.animation,
    });
  }, [clearTrack, setPlayhead, setIsPlaying, setTextOverlay]);

  const applyLayoutAnimation = useCallback(
    (preset: LayoutPreset, layout: ImageLayout) => {
      // Stop playback and reset
      setIsPlaying(false);
      setPlayhead(0);
      clearTrack('track-animation');

      // Merge preset device config with defaults
      const deviceConfig = { ...DEFAULT_DEVICE_CONFIG, ...preset.device };

      // Apply device config from preset
      setTextOverlay({
        enabled: false,
        devicePosition: deviceConfig.position,
        deviceScale: deviceConfig.scale,
        deviceOffsetX: deviceConfig.offsetX,
        deviceOffsetY: deviceConfig.offsetY,
        deviceAnimateIn: deviceConfig.animateIn,
        deviceAnimation: deviceConfig.animation,
      });

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
    [applyPreset, setTextOverlay, setDurationMs, addClip, setIsPlaying, setPlayhead, clearTrack]
  );

  const applyTextAnimation = useCallback(
    (preset: TextDevicePreset) => {
      // Clear everything first
      clearAnimations();

      // Load font
      loadGoogleFont('Manrope');

      // Get device config from text layout
      const layoutConfig = TEXT_LAYOUT_DEVICE_CONFIGS[preset.layout] || {};
      const deviceConfig = { ...DEFAULT_DEVICE_CONFIG, ...layoutConfig };

      // Override animation based on text animation type
      const deviceAnimation = getDeviceAnimation(preset.textAnimation, deviceConfig.animation);

      // Set text overlay with device config
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
        devicePosition: deviceConfig.position,
        deviceScale: deviceConfig.scale,
        deviceOffsetX: deviceConfig.offsetX,
        deviceOffsetY: deviceConfig.offsetY,
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
