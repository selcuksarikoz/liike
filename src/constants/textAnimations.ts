// Text Animation System
// Apple-style: animated headline + static tagline

export type TextAnimationType = 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'blur';
export type TextPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';
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
  // === APPLE-STYLE HERO INTROS ===
  {
    id: 'apple-intro',
    name: 'Apple Intro',
    textAnimation: 'blur',
    textPosition: 'top-center',
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
    id: 'keynote',
    name: 'Keynote',
    textAnimation: 'blur',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'This is iPhone',
    tagline: 'The best iPhone ever made.',
    durationMs: 4500,
    color: '#ffffff',
    icon: '🎤',
    headlineFontSize: 72,
    taglineFontSize: 28,
    deviceOffset: -30,
  },
  {
    id: 'pro-reveal',
    name: 'Pro Reveal',
    textAnimation: 'scale',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'Pro',
    tagline: 'Beyond professional.',
    durationMs: 3500,
    color: '#ffffff',
    icon: '⚡',
    headlineFontSize: 96,
    taglineFontSize: 24,
    deviceOffset: -25,
  },
  {
    id: 'dynamic-island',
    name: 'Dynamic',
    textAnimation: 'blur',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'Dynamic Island',
    tagline: 'A magical new way to interact.',
    durationMs: 4000,
    color: '#ffffff',
    icon: '🏝️',
    headlineFontSize: 56,
    taglineFontSize: 22,
    deviceOffset: -20,
  },
  // === APP STORE FEATURE STYLE ===
  {
    id: 'app-feature',
    name: 'App Feature',
    textAnimation: 'slide-up',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'App of the Day',
    tagline: 'Discover something new.',
    durationMs: 3500,
    color: '#ffffff',
    icon: '📱',
    headlineFontSize: 48,
    taglineFontSize: 20,
    deviceOffset: -15,
  },
  {
    id: 'launch-day',
    name: 'Launch Day',
    textAnimation: 'scale',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'Available Now',
    tagline: 'Download on the App Store.',
    durationMs: 3000,
    color: '#ffffff',
    icon: '🚀',
    headlineFontSize: 60,
    taglineFontSize: 22,
    deviceOffset: -20,
  },
  // === DRAMATIC REVEALS ===
  {
    id: 'one-more-thing',
    name: 'One More Thing',
    textAnimation: 'fade',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'One more thing...',
    tagline: '',
    durationMs: 5000,
    color: '#ffffff',
    icon: '✨',
    headlineFontSize: 56,
    taglineFontSize: 0,
    deviceOffset: -40,
  },
  {
    id: 'big-announcement',
    name: 'Big Announce',
    textAnimation: 'blur',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'Introducing',
    tagline: 'The future starts now.',
    durationMs: 4000,
    color: '#ffffff',
    icon: '🎉',
    headlineFontSize: 52,
    taglineFontSize: 26,
    deviceOffset: -25,
  },
  // === PRODUCT SHOWCASE ===
  {
    id: 'titanium',
    name: 'Titanium',
    textAnimation: 'blur',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'Titanium',
    tagline: 'The strongest material yet.',
    durationMs: 4000,
    color: '#ffffff',
    icon: '🔩',
    headlineFontSize: 80,
    taglineFontSize: 24,
    deviceOffset: -20,
  },
  {
    id: 'camera-pro',
    name: 'Camera Pro',
    textAnimation: 'scale',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: '48MP',
    tagline: 'Our most advanced camera system.',
    durationMs: 3500,
    color: '#ffffff',
    icon: '📸',
    headlineFontSize: 88,
    taglineFontSize: 22,
    deviceOffset: -25,
  },
  // === MINIMAL & CLEAN ===
  {
    id: 'minimal-clean',
    name: 'Minimal',
    textAnimation: 'fade',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'Think',
    tagline: 'Different.',
    durationMs: 3000,
    color: '#ffffff',
    icon: '🎯',
    headlineFontSize: 80,
    taglineFontSize: 32,
    deviceOffset: -20,
  },
  {
    id: 'hello-again',
    name: 'Hello Again',
    textAnimation: 'blur',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'Hello',
    tagline: "It's nice to meet you.",
    durationMs: 4000,
    color: '#ffffff',
    icon: '👋',
    headlineFontSize: 72,
    taglineFontSize: 24,
    deviceOffset: -30,
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
