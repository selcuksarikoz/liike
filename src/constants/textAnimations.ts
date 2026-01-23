// Text Animation System
// Apple-style: animated headline + static tagline

export type TextAnimationType = 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'blur';
export type TextPosition = 'top' | 'center' | 'bottom';
export type TextDeviceLayout =
  | 'text-top-device-bottom'
  | 'text-bottom-device-top'
  | 'text-left-device-right'
  | 'text-right-device-left'
  | 'text-center-device-behind'
  | 'text-overlay';

export type TextAnimationConfig = {
  id: TextAnimationType;
  name: string;
  icon: string;
};

export const TEXT_ANIMATIONS: TextAnimationConfig[] = [
  { id: 'fade', name: 'Fade', icon: '✨' },
  { id: 'slide-up', name: 'Slide Up', icon: '⬆️' },
  { id: 'slide-down', name: 'Slide Down', icon: '⬇️' },
  { id: 'scale', name: 'Scale', icon: '🔍' },
  { id: 'blur', name: 'Blur', icon: '👁️' },
];

export type TextDevicePreset = {
  id: string;
  name: string;
  textAnimation: TextAnimationType;
  textPosition: TextPosition;
  devicePosition: 'bottom' | 'center' | 'side' | 'top';
  layout: TextDeviceLayout;
  // First line = animated, second line = static
  headline: string;
  tagline: string;
  durationMs: number;
  color: string;
  icon: string;
  headlineFontSize: number;
  taglineFontSize: number;
  deviceOffset?: number; // negative = overflow bottom
};

export const TEXT_DEVICE_PRESETS: TextDevicePreset[] = [
  {
    id: 'apple-intro',
    name: 'Apple Intro',
    textAnimation: 'blur',
    textPosition: 'top',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'iPhone 16 Pro',
    tagline: 'Built for Apple Intelligence.',
    durationMs: 4000,
    color: '#ffffff',
    icon: '',
    headlineFontSize: 64,
    taglineFontSize: 24,
    deviceOffset: -20,
  },
  {
    id: 'slide-reveal',
    name: 'Slide Reveal',
    textAnimation: 'slide-up',
    textPosition: 'top',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'Your App',
    tagline: 'Simple. Fast. Secure.',
    durationMs: 3500,
    color: '#ffffff',
    icon: '🚀',
    headlineFontSize: 56,
    taglineFontSize: 22,
    deviceOffset: -20,
  },
  {
    id: 'scale-pop',
    name: 'Scale Pop',
    textAnimation: 'scale',
    textPosition: 'top',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'NEW',
    tagline: 'Now available everywhere',
    durationMs: 3000,
    color: '#ffffff',
    icon: '✨',
    headlineFontSize: 72,
    taglineFontSize: 20,
    deviceOffset: -20,
  },
  {
    id: 'fade-elegant',
    name: 'Fade Elegant',
    textAnimation: 'fade',
    textPosition: 'top',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'Introducing',
    tagline: 'The next generation',
    durationMs: 4000,
    color: '#ffffff',
    icon: '💎',
    headlineFontSize: 48,
    taglineFontSize: 24,
    deviceOffset: -20,
  },
  {
    id: 'drop-down',
    name: 'Drop Down',
    textAnimation: 'slide-down',
    textPosition: 'top',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'Hello',
    tagline: 'Welcome to the future',
    durationMs: 3500,
    color: '#ffffff',
    icon: '👋',
    headlineFontSize: 60,
    taglineFontSize: 22,
    deviceOffset: -20,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    textAnimation: 'blur',
    textPosition: 'top',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'Think',
    tagline: 'Different',
    durationMs: 3000,
    color: '#ffffff',
    icon: '🎯',
    headlineFontSize: 80,
    taglineFontSize: 32,
    deviceOffset: -20,
  },
];

// Simple keyframe generator - only for headline, tagline is always visible
export const generateTextKeyframes = (
  type: TextAnimationType,
  progress: number
): { opacity: number; transform: string; filter?: string } => {
  // Clamp and ease
  const p = Math.min(1, Math.max(0, progress));
  const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic

  switch (type) {
    case 'fade':
      return {
        opacity: ease,
        transform: 'none',
      };

    case 'slide-up':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 30}px)`,
      };

    case 'slide-down':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * -30}px)`,
      };

    case 'scale':
      return {
        opacity: ease,
        transform: `scale(${0.85 + ease * 0.15})`,
      };

    case 'blur':
      return {
        opacity: ease,
        transform: `scale(${0.98 + ease * 0.02})`,
        filter: `blur(${(1 - ease) * 8}px)`,
      };

    default:
      return { opacity: 1, transform: 'none' };
  }
};

// For backwards compatibility
export type { TextDevicePreset as TextPreset };
