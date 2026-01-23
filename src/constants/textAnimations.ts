// Text Animation System
// Apple-style: animated headline + static tagline

export type TextAnimationType =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'scale'
  | 'blur'
  | 'bounce'
  | 'typewriter'
  | 'glitch'
  | 'wave'
  | 'flip'
  | 'zoom-blur'
  | 'elastic';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export const ANIMATION_SPEED_MULTIPLIERS: Record<AnimationSpeed, number> = {
  slow: 0.5,
  normal: 1,
  fast: 2,
};

// CSS transition durations based on speed
export const ANIMATION_SPEED_DURATIONS: Record<AnimationSpeed, number> = {
  slow: 2000,
  normal: 1000,
  fast: 400,
};

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
  { id: 'bounce', name: 'Bounce', icon: '🏀' },
  { id: 'typewriter', name: 'Typewriter', icon: '⌨️' },
  { id: 'glitch', name: 'Glitch', icon: '📺' },
  { id: 'wave', name: 'Wave', icon: '🌊' },
  { id: 'flip', name: 'Flip', icon: '🔄' },
  { id: 'zoom-blur', name: 'Zoom Blur', icon: '💨' },
  { id: 'elastic', name: 'Elastic', icon: '🎯' },
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
    textAnimation: 'zoom-blur',
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
    textAnimation: 'elastic',
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
    textAnimation: 'flip',
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
    textAnimation: 'bounce',
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
    textAnimation: 'elastic',
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
    textAnimation: 'typewriter',
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
    textAnimation: 'zoom-blur',
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
    textAnimation: 'flip',
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
    textAnimation: 'wave',
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
  // === SPLIT LAYOUTS ===
  {
    id: 'split-left',
    name: 'Split Left',
    textAnimation: 'slide-up',
    textPosition: 'center-left',
    devicePosition: 'side',
    layout: 'text-left-device-right',
    headline: 'Beautiful Design',
    tagline: 'Crafted with care.',
    durationMs: 3500,
    color: '#ffffff',
    icon: '◀️',
    headlineFontSize: 48,
    taglineFontSize: 20,
    deviceOffset: 0,
  },
  {
    id: 'split-right',
    name: 'Split Right',
    textAnimation: 'slide-up',
    textPosition: 'center-right',
    devicePosition: 'side',
    layout: 'text-right-device-left',
    headline: 'Next Level',
    tagline: 'Experience the difference.',
    durationMs: 3500,
    color: '#ffffff',
    icon: '▶️',
    headlineFontSize: 48,
    taglineFontSize: 20,
    deviceOffset: 0,
  },
  // === CINEMATIC ===
  {
    id: 'cinema-rise',
    name: 'Cinema Rise',
    textAnimation: 'slide-up',
    textPosition: 'bottom-center',
    devicePosition: 'center',
    layout: 'text-bottom-device-top',
    headline: 'Coming Soon',
    tagline: 'A new era begins.',
    durationMs: 4500,
    color: '#ffffff',
    icon: '🎬',
    headlineFontSize: 56,
    taglineFontSize: 22,
    deviceOffset: -30,
  },
  {
    id: 'epic-drop',
    name: 'Epic Drop',
    textAnimation: 'bounce',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'Game Changer',
    tagline: 'Redefining possibilities.',
    durationMs: 4000,
    color: '#ffffff',
    icon: '🔥',
    headlineFontSize: 64,
    taglineFontSize: 24,
    deviceOffset: -40,
  },
  // === SOCIAL MEDIA STYLE ===
  {
    id: 'story-style',
    name: 'Story Style',
    textAnimation: 'elastic',
    textPosition: 'bottom-center',
    devicePosition: 'top',
    layout: 'text-bottom-device-top',
    headline: 'Swipe Up',
    tagline: 'Get yours now →',
    durationMs: 3000,
    color: '#ffffff',
    icon: '📱',
    headlineFontSize: 52,
    taglineFontSize: 20,
    deviceOffset: -25,
  },
  {
    id: 'reel-hook',
    name: 'Reel Hook',
    textAnimation: 'typewriter',
    textPosition: 'center',
    devicePosition: 'center',
    layout: 'text-center-device-behind',
    headline: 'Wait for it...',
    tagline: '',
    durationMs: 2500,
    color: '#ffffff',
    icon: '🎯',
    headlineFontSize: 72,
    taglineFontSize: 0,
    deviceOffset: 0,
  },
  // === GRADIENT & COLOR ===
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    textAnimation: 'glitch',
    textPosition: 'center',
    devicePosition: 'center',
    layout: 'text-overlay',
    headline: 'ELECTRIC',
    tagline: 'Feel the energy.',
    durationMs: 3500,
    color: '#ffffff',
    icon: '⚡',
    headlineFontSize: 80,
    taglineFontSize: 24,
    deviceOffset: 0,
  },
  {
    id: 'sunset-vibes',
    name: 'Sunset Vibes',
    textAnimation: 'fade',
    textPosition: 'bottom-left',
    devicePosition: 'center',
    layout: 'text-overlay',
    headline: 'Golden Hour',
    tagline: 'Catch the moment.',
    durationMs: 4000,
    color: '#ffffff',
    icon: '🌅',
    headlineFontSize: 56,
    taglineFontSize: 22,
    deviceOffset: 0,
  },
  // === PLAYFUL ===
  {
    id: 'bounce-pop',
    name: 'Bounce Pop',
    textAnimation: 'bounce',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'POW!',
    tagline: 'That just happened.',
    durationMs: 2500,
    color: '#ffffff',
    icon: '💥',
    headlineFontSize: 96,
    taglineFontSize: 24,
    deviceOffset: -20,
  },
  {
    id: 'party-mode',
    name: 'Party Mode',
    textAnimation: 'elastic',
    textPosition: 'center',
    devicePosition: 'center',
    layout: 'text-center-device-behind',
    headline: 'LET\'S GO!',
    tagline: 'Turn it up.',
    durationMs: 3000,
    color: '#ffffff',
    icon: '🎉',
    headlineFontSize: 72,
    taglineFontSize: 26,
    deviceOffset: 0,
  },
  // === PROFESSIONAL ===
  {
    id: 'corporate-clean',
    name: 'Corporate Clean',
    textAnimation: 'fade',
    textPosition: 'center-left',
    devicePosition: 'side',
    layout: 'text-left-device-right',
    headline: 'Enterprise Ready',
    tagline: 'Built for scale.',
    durationMs: 4000,
    color: '#ffffff',
    icon: '💼',
    headlineFontSize: 44,
    taglineFontSize: 18,
    deviceOffset: 0,
  },
  {
    id: 'saas-hero',
    name: 'SaaS Hero',
    textAnimation: 'slide-up',
    textPosition: 'center-left',
    devicePosition: 'side',
    layout: 'text-left-device-right',
    headline: '10x Faster',
    tagline: 'Your workflow, supercharged.',
    durationMs: 3500,
    color: '#ffffff',
    icon: '🚀',
    headlineFontSize: 56,
    taglineFontSize: 20,
    deviceOffset: 0,
  },
  // === TESTIMONIAL STYLE ===
  {
    id: 'quote-card',
    name: 'Quote Card',
    textAnimation: 'typewriter',
    textPosition: 'top-left',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: '"Absolutely amazing"',
    tagline: '— Happy Customer',
    durationMs: 4000,
    color: '#ffffff',
    icon: '💬',
    headlineFontSize: 40,
    taglineFontSize: 18,
    deviceOffset: -15,
  },
  // === COUNTDOWN / URGENCY ===
  {
    id: 'countdown',
    name: 'Countdown',
    textAnimation: 'flip',
    textPosition: 'center',
    devicePosition: 'center',
    layout: 'text-center-device-behind',
    headline: '24:00:00',
    tagline: 'Limited time offer.',
    durationMs: 3000,
    color: '#ffffff',
    icon: '⏰',
    headlineFontSize: 80,
    taglineFontSize: 22,
    deviceOffset: 0,
  },
  {
    id: 'flash-sale',
    name: 'Flash Sale',
    textAnimation: 'bounce',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: '50% OFF',
    tagline: 'Today only!',
    durationMs: 2500,
    color: '#ffffff',
    icon: '🏷️',
    headlineFontSize: 88,
    taglineFontSize: 28,
    deviceOffset: -30,
  },
  // === TECH / FUTURISTIC ===
  {
    id: 'glitch-fx',
    name: 'Glitch FX',
    textAnimation: 'glitch',
    textPosition: 'center',
    devicePosition: 'center',
    layout: 'text-overlay',
    headline: 'SYSTEM_READY',
    tagline: '> Initializing...',
    durationMs: 3500,
    color: '#ffffff',
    icon: '🖥️',
    headlineFontSize: 64,
    taglineFontSize: 20,
    deviceOffset: 0,
  },
  {
    id: 'ai-powered',
    name: 'AI Powered',
    textAnimation: 'zoom-blur',
    textPosition: 'top-center',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    headline: 'AI Inside',
    tagline: 'Intelligent by design.',
    durationMs: 4000,
    color: '#ffffff',
    icon: '🤖',
    headlineFontSize: 60,
    taglineFontSize: 22,
    deviceOffset: -25,
  },
  // === MUSIC / CREATIVE ===
  {
    id: 'album-drop',
    name: 'Album Drop',
    textAnimation: 'wave',
    textPosition: 'bottom-center',
    devicePosition: 'center',
    layout: 'text-bottom-device-top',
    headline: 'OUT NOW',
    tagline: 'Stream everywhere.',
    durationMs: 3000,
    color: '#ffffff',
    icon: '🎵',
    headlineFontSize: 72,
    taglineFontSize: 24,
    deviceOffset: -20,
  },
  {
    id: 'podcast-promo',
    name: 'Podcast Promo',
    textAnimation: 'slide-up',
    textPosition: 'bottom-left',
    devicePosition: 'top',
    layout: 'text-bottom-device-top',
    headline: 'New Episode',
    tagline: 'Listen now on all platforms.',
    durationMs: 3500,
    color: '#ffffff',
    icon: '🎙️',
    headlineFontSize: 48,
    taglineFontSize: 18,
    deviceOffset: -30,
  },
];

// Easing functions
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const easeOutElastic = (p: number) => {
  if (p === 0 || p === 1) return p;
  return Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
};
const easeOutBounce = (p: number) => {
  if (p < 1 / 2.75) return 7.5625 * p * p;
  if (p < 2 / 2.75) return 7.5625 * (p -= 1.5 / 2.75) * p + 0.75;
  if (p < 2.5 / 2.75) return 7.5625 * (p -= 2.25 / 2.75) * p + 0.9375;
  return 7.5625 * (p -= 2.625 / 2.75) * p + 0.984375;
};

// Keyframe generator with more animation types
export const generateTextKeyframes = (
  type: TextAnimationType,
  progress: number
): { opacity: number; transform: string; filter?: string; clipPath?: string } => {
  const p = Math.min(1, Math.max(0, progress));
  const ease = easeOutCubic(p);

  switch (type) {
    case 'fade':
      return {
        opacity: ease,
        transform: 'none',
      };

    case 'slide-up':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 40}px)`,
      };

    case 'slide-down':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * -40}px)`,
      };

    case 'scale':
      return {
        opacity: ease,
        transform: `scale(${0.7 + ease * 0.3})`,
      };

    case 'blur':
      return {
        opacity: ease,
        transform: `scale(${0.98 + ease * 0.02})`,
        filter: `blur(${(1 - ease) * 8}px)`,
      };

    case 'bounce': {
      const bounceEase = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateY(${(1 - bounceEase) * -60}px) scale(${0.8 + bounceEase * 0.2})`,
      };
    }

    case 'typewriter':
      return {
        opacity: 1,
        transform: 'none',
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
      };

    case 'glitch': {
      const glitchOffset = p < 0.9 ? Math.sin(p * 50) * (1 - p) * 3 : 0;
      return {
        opacity: p < 0.1 ? p * 10 : 1,
        transform: `translateX(${glitchOffset}px) skewX(${glitchOffset}deg)`,
        filter: p < 0.8 ? `hue-rotate(${(1 - p) * 90}deg)` : 'none',
      };
    }

    case 'wave': {
      const waveY = Math.sin(p * Math.PI * 2) * (1 - p) * 20;
      return {
        opacity: ease,
        transform: `translateY(${waveY}px) rotate(${(1 - ease) * 5}deg)`,
      };
    }

    case 'flip':
      return {
        opacity: p > 0.5 ? 1 : p * 2,
        transform: `perspective(400px) rotateX(${(1 - ease) * 90}deg)`,
      };

    case 'zoom-blur': {
      const zoomScale = 0.5 + ease * 0.5;
      return {
        opacity: ease,
        transform: `scale(${zoomScale})`,
        filter: `blur(${(1 - ease) * 15}px)`,
      };
    }

    case 'elastic': {
      const elasticEase = easeOutElastic(p);
      return {
        opacity: Math.min(1, p * 2),
        transform: `scale(${elasticEase})`,
      };
    }

    default:
      return { opacity: 1, transform: 'none' };
  }
};

// For backwards compatibility
export type { TextDevicePreset as TextPreset };

// =============================================================================
// DEVICE/MEDIA ANIMATION SYSTEM
// =============================================================================

export type DeviceAnimationType =
  | 'none'
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'rise'
  | 'drop'
  | 'peek-bottom'
  | 'peek-right'
  | 'rotate-in'
  | 'flip-up'
  | 'bounce-in';

export const DEVICE_ANIMATIONS: { id: DeviceAnimationType; name: string; icon: string }[] = [
  { id: 'none', name: 'None', icon: '⏹️' },
  { id: 'fade', name: 'Fade In', icon: '✨' },
  { id: 'slide-up', name: 'Slide Up', icon: '⬆️' },
  { id: 'slide-down', name: 'Slide Down', icon: '⬇️' },
  { id: 'slide-left', name: 'Slide Left', icon: '⬅️' },
  { id: 'slide-right', name: 'Slide Right', icon: '➡️' },
  { id: 'zoom-in', name: 'Zoom In', icon: '🔍' },
  { id: 'zoom-out', name: 'Zoom Out', icon: '🔎' },
  { id: 'rise', name: 'Rise', icon: '🌅' },
  { id: 'drop', name: 'Drop', icon: '⬇️' },
  { id: 'peek-bottom', name: 'Peek Bottom', icon: '👀' },
  { id: 'peek-right', name: 'Peek Right', icon: '👁️' },
  { id: 'rotate-in', name: 'Rotate In', icon: '🔄' },
  { id: 'flip-up', name: 'Flip Up', icon: '🔃' },
  { id: 'bounce-in', name: 'Bounce In', icon: '🏀' },
];

/**
 * Generate CSS transform/opacity for device entry animations
 * @param type - Animation type
 * @param progress - Animation progress (0 to 1)
 * @returns CSS properties for transform and opacity
 */
export const generateDeviceKeyframes = (
  type: DeviceAnimationType,
  progress: number
): { opacity: number; transform: string } => {
  const p = Math.min(1, Math.max(0, progress));
  const ease = easeOutCubic(p);

  switch (type) {
    case 'none':
      return { opacity: 1, transform: 'none' };

    case 'fade':
      return {
        opacity: ease,
        transform: 'none',
      };

    case 'slide-up':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 100}%)`,
      };

    case 'slide-down':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * -100}%)`,
      };

    case 'slide-left':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * 100}%)`,
      };

    case 'slide-right':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * -100}%)`,
      };

    case 'zoom-in':
      return {
        opacity: ease,
        transform: `scale(${0.5 + ease * 0.5})`,
      };

    case 'zoom-out':
      return {
        opacity: ease,
        transform: `scale(${1.5 - ease * 0.5})`,
      };

    case 'rise':
      // Rises from below with slight zoom
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 50}%) scale(${0.9 + ease * 0.1})`,
      };

    case 'drop':
      // Drops from above with overshoot
      const dropBounce = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateY(${(1 - dropBounce) * -80}%)`,
      };

    case 'peek-bottom':
      // Device peeks in from bottom, stays partially visible
      return {
        opacity: 1,
        transform: `translateY(${(1 - ease) * 60 + 20}%)`,
      };

    case 'peek-right':
      // Device peeks in from right, stays partially visible
      return {
        opacity: 1,
        transform: `translateX(${(1 - ease) * 60 + 20}%)`,
      };

    case 'rotate-in':
      return {
        opacity: ease,
        transform: `rotate(${(1 - ease) * -15}deg) scale(${0.8 + ease * 0.2})`,
      };

    case 'flip-up':
      return {
        opacity: p > 0.3 ? 1 : p * 3,
        transform: `perspective(1000px) rotateX(${(1 - ease) * 90}deg)`,
      };

    case 'bounce-in': {
      const bounceEase = easeOutElastic(p);
      return {
        opacity: Math.min(1, p * 2),
        transform: `scale(${bounceEase})`,
      };
    }

    default:
      return { opacity: 1, transform: 'none' };
  }
};
