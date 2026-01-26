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

// =============================================================================
// DEVICE/MEDIA ANIMATION SYSTEM
// =============================================================================

export type DeviceAnimationType =
  | 'none'
  | 'fade'
  | 'zoom-in'
  | 'zoom-out'
  | 'tilt-reveal'
  | 'swing-in'
  | 'spiral-in'
  | 'bounce-in'
  | 'rise'
  | 'drop'
  | 'flip-up'
  | 'rotate-in'
  | 'wobble-3d';

export const DEVICE_ANIMATIONS: { id: DeviceAnimationType; name: string; icon: string }[] = [
  { id: 'none', name: 'None', icon: '⏹️' },
  { id: 'tilt-reveal', name: 'Tilt Reveal', icon: '📐' },
  { id: 'swing-in', name: 'Swing In', icon: '🪀' },
  { id: 'spiral-in', name: 'Spiral In', icon: '🌀' },
  { id: 'zoom-in', name: 'Zoom In', icon: '🔍' },
  { id: 'bounce-in', name: 'Bounce In', icon: '🏀' },
  { id: 'rise', name: 'Rise', icon: '🌅' },
  { id: 'drop', name: 'Drop', icon: '⬇️' },
  { id: 'flip-up', name: 'Flip Up', icon: '🔃' },
  { id: 'rotate-in', name: 'Rotate In', icon: '🔄' },
  { id: 'wobble-3d', name: '3D Wobble', icon: '🧊' },
];

/**
 * Generate CSS transform/opacity for device entry animations
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
      return { opacity: ease, transform: 'none' };

    case 'tilt-reveal':
      return {
        opacity: ease,
        transform: `perspective(1000px) rotateX(${(1 - ease) * 45}deg) rotateY(${(1 - ease) * -45}deg) scale(${0.8 + ease * 0.2}) translateY(${(1 - ease) * 100}px)`,
      };

    case 'swing-in':
      return {
        opacity: ease,
        transform: `perspective(1000px) rotateY(${(1 - Math.sin(p * Math.PI)) * 30}deg) translateX(${(1 - ease) * -100}px)`,
      };

    case 'spiral-in':
      return {
        opacity: ease,
        transform: `scale(${0.2 + ease * 0.8}) rotate(${(1 - ease) * 720}deg) translateY(${(1 - ease) * 200}px)`,
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
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 50}%) scale(${0.9 + ease * 0.1})`,
      };

    case 'drop': {
      const dropBounce = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateY(${(1 - dropBounce) * -80}%)`,
      };
    }

    case 'flip-up':
      return {
        opacity: p > 0.3 ? 1 : p * 3,
        transform: `perspective(1000px) rotateX(${(1 - ease) * 90}deg)`,
      };

    case 'rotate-in':
      return {
        opacity: ease,
        transform: `rotate(${(1 - ease) * -15}deg) scale(${0.8 + ease * 0.2})`,
      };

    case 'bounce-in': {
      const bounceEase = easeOutElastic(p);
      return {
        opacity: Math.min(1, p * 2),
        transform: `scale(${bounceEase})`,
      };
    }

    case 'wobble-3d': {
      const wobble = Math.sin(p * Math.PI * 4) * (1 - p) * 15;
      return {
        opacity: ease,
        transform: `perspective(1000px) rotateX(${wobble}deg) rotateY(${wobble}deg)`,
      };
    }

    default:
      return { opacity: 1, transform: 'none' };
  }
};
