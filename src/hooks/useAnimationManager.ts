import { useCallback } from 'react';
import { useRenderStore, type ImageLayout } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import {
  DEFAULT_DEVICE_CONFIG,
  DEFAULT_TEXT_CONFIG,
  type LayoutPreset,
} from '../constants/layoutAnimationPresets';
import { ANIMATION_SPEED_MULTIPLIERS } from '../constants/textAnimations';
import { loadGoogleFont } from './useFontLoader';

export const useAnimationManager = () => {
  const { applyPreset, setTextOverlay, setMediaPosition, setDurationMs } = useRenderStore();
  const { addClip, clearTrack, setPlayhead, setIsPlaying } = useTimelineStore();

  // Clear all animations and reset to defaults
  const clearAnimations = useCallback(() => {
    setIsPlaying(false);
    setPlayhead(0);
    clearTrack('track-animation');
    setMediaPosition(DEFAULT_DEVICE_CONFIG.position);
    setTextOverlay({
      enabled: false,
      deviceAnimateIn: DEFAULT_DEVICE_CONFIG.animateIn,
      deviceAnimation: DEFAULT_DEVICE_CONFIG.animation,
    });
  }, [clearTrack, setPlayhead, setIsPlaying, setTextOverlay, setMediaPosition]);

  // Apply any preset (layout or text)
  const applyAnimation = useCallback(
    (preset: LayoutPreset, layout: ImageLayout = 'single') => {
      // stop playback and reset
      setIsPlaying(false);
      setPlayhead(0);
      clearTrack('track-animation');

      // Get speed multiplier from store (indirectly via state inside renderStore or similar)
      const speed = useRenderStore.getState().animationSpeed;
      const multiplier = ANIMATION_SPEED_MULTIPLIERS[speed] || 1;

      // Calculate effective duration based on speed
      // If speed is 'fast', multiplier is 2, so we divide duration by 2
      const effectiveDuration = preset.durationMs / multiplier;

      // Merge device config with defaults
      const deviceConfig = { ...DEFAULT_DEVICE_CONFIG, ...preset.device };

      // Check if this is a text preset
      const hasText = preset.text?.enabled || preset.category === 'text';

      // Set media position from preset
      setMediaPosition(deviceConfig.position);

      if (hasText && preset.text) {
        // Load font
        loadGoogleFont(preset.text.fontFamily || 'Manrope');

        // Merge text config with defaults
        const textConfig = { ...DEFAULT_TEXT_CONFIG, ...preset.text };

        // Set text overlay
        setTextOverlay({
          enabled: true,
          headline: textConfig.headline,
          tagline: textConfig.tagline,
          text: `${textConfig.headline}\n${textConfig.tagline}`,
          fontFamily: textConfig.fontFamily,
          animation: textConfig.animation,
          position: textConfig.position,
          fontSize: textConfig.headlineFontSize,
          taglineFontSize: textConfig.taglineFontSize,
          color: textConfig.color,
          deviceAnimateIn: deviceConfig.animateIn,
          deviceAnimation: deviceConfig.animation,
        });
      } else {
        // Layout-only preset - disable text
        setTextOverlay({
          enabled: false,
          deviceAnimateIn: deviceConfig.animateIn,
          deviceAnimation: deviceConfig.animation,
        });
      }

      // Apply layout preset (rotation, layout type)
      applyPreset({
        rotationX: preset.rotationX,
        rotationY: preset.rotationY,
        rotationZ: preset.rotationZ,
        imageLayout: layout,
      });

      // Add animation clip if preset has animations
      const hasAnimation = preset.animations.some((a) => a.type !== 'none');
      if (hasAnimation) {
        setDurationMs(effectiveDuration);
        addClip('track-animation', {
          trackId: 'track-animation',
          type: 'animation',
          name: preset.name,
          startMs: 0,
          durationMs: effectiveDuration,
          color: preset.color,
          icon: preset.icon,
          data: {
            animationPreset: {
              id: preset.id,
              name: preset.name,
              animations: preset.animations.map((a) => a.type).filter((t) => t !== 'none') as any[],
              icon: preset.icon,
              color: preset.color,
              duration: effectiveDuration,
              easing: preset.animations[0]?.easing || 'ease-in-out',
            },
          },
        });
        setTimeout(() => setIsPlaying(true), 100);
      }
    },
    [setIsPlaying, setPlayhead, clearTrack, setMediaPosition, setTextOverlay, applyPreset, setDurationMs, addClip]
  );

  return {
    clearAnimations,
    applyAnimation,
    // Legacy aliases
    applyLayoutAnimation: applyAnimation,
    applyTextAnimation: applyAnimation,
  };
};
