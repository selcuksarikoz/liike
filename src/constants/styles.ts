// Re-export from split files for backward compatibility
export {
  type StylePreset,
  type BorderType,
  type ShadowType,
  STYLE_PRESETS,
  BORDER_TYPES,
  SHADOW_TYPES,
  getShadowStyle,
} from './stylePresets';

export {
  type FramePreset,
  type FrameCategory,
  FRAMES_DATA,
  getFrameLabel,
} from './framePresets';

export {
  type LayoutAnimation,
  type LayoutPreset,
  type DevicePosition,
  type DeviceConfig,
  LAYOUT_PRESETS,
  DEFAULT_DEVICE_CONFIG,
} from './layoutAnimationPresets';
