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
  | 'elastic'
  | 'shimmer'
  | 'glitch-rgb'
  | 'reveal-split'
  | 'mask-reveal'
  | 'perspective-3d'
  | 'blur-reveal'
  | 'expand-letter'
  | 'strobe'
  | 'float-drift'
  // Apple Style
  | 'apple-reveal'
  | 'hero-text'
  | 'gradient-flow'
  | 'dynamic-island'
  | 'cinematic-fade'
  // Clean / Apple Style
  | 'soft-blur-up'
  | 'clean-fade-scale'
  | 'ios-slide-in'
  | 'cupertino-reveal'
  | 'dynamic-island-expand'
  | 'apple-bounce'
  | 'siri-wave'
  | 'spotlight-reveal'
  // Premium / App
  | 'app-launch-pop'
  | 'card-entry-slide'
  | 'sheet-slide-up'
  | 'modal-pop-center'
  | 'notification-slide'
  // Typography
  | 'tracking-in-expand'
  | 'blur-in-expand'
  | 'focus-in-expand'
  | 'text-focus-contract'
  | 'letter-shuffling'
  // 3D / Creative
  | 'skew-in-slide'
  | 'rotate-in-down-left'
  | 'roll-in-blurred'
  | 'jack-in-the-box'
  | 'swing-in-top-fwd'
  | '3d-flip-down'
  | '3d-rotate-in'
  // Cyber / Glitch
  | 'cyber-glitch-2'
  | 'pixel-reveal'
  | 'decoder-text'
  | 'matrix-reveal'
  | 'hacker-type'
  // Nature / Organic
  | 'water-drop'
  | 'leaf-float'
  | 'wind-blow'
  | 'solar-flare'
  | 'breathe'
  // Modern Web
  | 'stripe-reveal'
  | 'curtain-rise'
  | 'smooth-ease'
  | 'liquid-flow'
  | 'elastic-snap'
  // Retro
  | 'retro-terminal'
  | 'vhs-tracking'
  | '8bit-slide'
  | 'arcade-pop'
  | 'neon-flicker'
  // Minimalist
  | 'minimal-fade'
  | 'thin-slice'
  | 'simple-wipe'
  | 'center-line'
  | 'border-draw';

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
  category?: 'basic' | 'premium' | 'apple';
};

export const TEXT_ANIMATIONS: TextAnimationConfig[] = [
  // Apple / Premium
  { id: 'apple-reveal', name: 'Apple Reveal', icon: '🍎', category: 'apple' },
  { id: 'hero-text', name: 'Hero Text', icon: '⭐', category: 'apple' },
  { id: 'gradient-flow', name: 'Gradient Flow', icon: '🌈', category: 'apple' },
  { id: 'cinematic-fade', name: 'Cinematic', icon: '🎬', category: 'apple' },
  
  // Clean / Modern
  { id: 'slide-up', name: 'Slide Up', icon: '⬆️', category: 'basic' },
  { id: 'blur-reveal', name: 'Blur Reveal', icon: '🌫️', category: 'premium' },
  { id: 'mask-reveal', name: 'Mask Reveal', icon: '🎭', category: 'premium' },
  { id: 'typewriter', name: 'Typewriter', icon: '⌨️', category: 'basic' },
  
  // Dynamic
  { id: 'bounce', name: 'Bounce', icon: '🏀', category: 'basic' },
  { id: 'elastic', name: 'Elastic', icon: '🎯', category: 'basic' },
  { id: 'wave', name: 'Wave', icon: '🌊', category: 'basic' },
  { id: 'glitch', name: 'Glitch', icon: '📺', category: 'premium' },
  
  // 3D / FX
  { id: 'perspective-3d', name: '3D Perspective', icon: '🧊', category: 'premium' },
  { id: 'zoom-blur', name: 'Zoom Blur', icon: '💨', category: 'premium' },
  { id: 'shimmer', name: 'Shimmer', icon: '✨', category: 'premium' },
  { id: 'expand-letter', name: 'Expand', icon: '↔️', category: 'basic' },
  // Clean / Apple Style
  { id: 'soft-blur-up', name: 'Soft Blur Up', icon: '☁️', category: 'apple' },
  { id: 'clean-fade-scale', name: 'Clean Scale', icon: '⚪', category: 'apple' },
  { id: 'ios-slide-in', name: 'iOS Slide', icon: '📱', category: 'apple' },
  { id: 'cupertino-reveal', name: 'Cupertino', icon: '🍏', category: 'apple' },
  { id: 'dynamic-island-expand', name: 'Island Pop', icon: '🏝️', category: 'apple' },
  { id: 'apple-bounce', name: 'Soft Bounce', icon: '🏀', category: 'apple' },
  { id: 'siri-wave', name: 'Siri Wave', icon: '🌈', category: 'apple' },
  { id: 'spotlight-reveal', name: 'Spotlight', icon: '🔦', category: 'apple' },

  // Typography
  { id: 'tracking-in-expand', name: 'Tracking Exp', icon: '↔️', category: 'premium' },
  { id: 'blur-in-expand', name: 'Blur Exp', icon: '😶‍🌫️', category: 'premium' },
  { id: 'focus-in-expand', name: 'Focus In', icon: '👁️', category: 'premium' },
  { id: 'text-focus-contract', name: 'Focus Con', icon: '🎯', category: 'premium' },
  { id: 'letter-shuffling', name: 'Shuffle', icon: '🎲', category: 'premium' },

  // 3D / Creative
  { id: 'skew-in-slide', name: 'Skew Slide', icon: '📐', category: 'basic' },
  { id: 'rotate-in-down-left', name: 'Rotate Down', icon: '🔄', category: 'basic' },
  { id: 'wheel-spin', name: 'Wheel Spin', icon: '🎡', category: 'basic' }, // Added to ensure 50+
  { id: 'jack-in-the-box', name: 'Jack Box', icon: '🎁', category: 'basic' },
  { id: 'swing-in-top-fwd', name: 'Swing Fwd', icon: '🎢', category: 'premium' },

  // Cyber / Glitch
  { id: 'cyber-glitch-2', name: 'Cyber 2', icon: '👾', category: 'premium' },
  { id: 'pixel-reveal', name: 'Pixel', icon: '🔳', category: 'premium' },
  { id: 'decoder-text', name: 'Decoder', icon: '🔓', category: 'premium' },
  { id: 'matrix-reveal', name: 'Matrix', icon: '🔢', category: 'premium' },
  { id: 'hacker-type', name: 'Hacker', icon: '👨‍💻', category: 'premium' },

  // Modern Web
  { id: 'stripe-reveal', name: 'Stripe', icon: '🦓', category: 'basic' },
  { id: 'curtain-rise', name: 'Curtain', icon: '🎭', category: 'basic' },
  { id: 'smooth-ease', name: 'Smooth', icon: '🧈', category: 'apple' },
  { id: 'liquid-flow', name: 'Liquid', icon: '💧', category: 'premium' },
  { id: 'elastic-snap', name: 'Snap', icon: '🫰', category: 'premium' },
  
  // Retro
  { id: 'retro-terminal', name: 'Terminal', icon: '📟', category: 'basic' },
  { id: 'vhs-tracking', name: 'VHS', icon: '📼', category: 'premium' },
  { id: '8bit-slide', name: '8-Bit', icon: '🕹️', category: 'basic' },
  { id: 'arcade-pop', name: 'Arcade', icon: '🎰', category: 'basic' },
  { id: 'neon-flicker', name: 'Neon', icon: '💡', category: 'premium' },
  
  // Minimalist
  { id: 'minimal-fade', name: 'Minimal', icon: '➖', category: 'apple' },
  { id: 'thin-slice', name: 'Slice', icon: '🔪', category: 'basic' },
  { id: 'simple-wipe', name: 'Wipe', icon: '🧹', category: 'basic' },
  { id: 'center-line', name: 'Center', icon: '📍', category: 'basic' },
  { id: 'border-draw', name: 'Border', icon: '🖼️', category: 'basic' },
];

// Easing functions
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const easeOutQuart = (p: number) => 1 - Math.pow(1 - p, 4);
const easeOutExpo = (x: number): number => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
const easeOutBack = (x: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
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
): { opacity: number; transform: string; filter?: string; clipPath?: string; letterSpacing?: string; backgroundPosition?: string; backgroundImage?: string; color?: string; backgroundClip?: string; WebkitBackgroundClip?: string; } => {
  const p = Math.min(1, Math.max(0, progress));
  const ease = easeOutCubic(p);
  const easeExpo = easeOutExpo(p);
  const easeQuart = easeOutQuart(p);

  switch (type) {
    // --- APPLE STYLE ANIMATIONS ---
    case 'apple-reveal':
      return {
        opacity: easeQuart,
        transform: `translateY(${(1 - easeQuart) * 40}px) scale(${0.95 + easeQuart * 0.05})`,
        filter: `blur(${(1 - easeQuart) * 10}px)`,
        letterSpacing: `${(1 - easeQuart) * -1}px`, // Slight expansion
      };
      
    case 'hero-text':
      // Big, bold entrance typical of product reveals
      return {
        opacity: easeExpo,
        transform: `scale(${1.1 - easeExpo * 0.1}) translateY(${(1 - easeExpo) * 20}px)`,
        filter: `blur(${(1 - easeExpo) * 4}px)`,
      };

    case 'gradient-flow':
      // Requires text to have background-clip: text typically, mimicking here with standard Props
      // Note: Full gradient flow requires CSS keyframes usually, here we animate opacity/transform
      // and assume the component handles the gradient class.
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 10}px)`,
        filter: `brightness(${0.8 + ease * 0.4}) saturate(${ease * 1.2})`, // enhancing colors
      };

    case 'cinematic-fade':
      // Slow, luxurious fade in
      return {
        opacity: p < 0.2 ? p * 5 : 1, // fast fade in
        transform: `translateY(${(1 - easeQuart) * 15}px)`,
        letterSpacing: `${(1 - easeQuart) * 2}px`, // expanding spacing
        filter: `blur(${(1 - p) * 4}px)`,
      };

    // --- STANDARD ANIMATIONS ---
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
        transform: `scale(${elasticEase}) translateZ(0)`,
      };
    }

    case 'shimmer':
      return {
        opacity: ease,
        transform: 'none',
        filter: `brightness(${1 + Math.sin(p * Math.PI * 4) * 0.5})`,
      };

    case 'glitch-rgb':
      const gOffset = Math.sin(p * 40) * (1 - p) * 10;
      return {
        opacity: ease,
        transform: `translateX(${gOffset}px) translateZ(0)`,
        filter: `drop-shadow(${gOffset}px 0 0 #ff0000) drop-shadow(${-gOffset}px 0 0 #00ffff)`,
      };

    case 'reveal-split':
      return {
        opacity: ease,
        transform: `perspective(500px) rotateX(${(1 - ease) * 90}deg)`,
        clipPath: `inset(0 0 ${(1 - p) * 100}% 0)`,
      };

    case 'mask-reveal':
      return {
        opacity: ease,
        transform: 'none',
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
      };

    case 'perspective-3d':
      return {
        opacity: ease,
        transform: `perspective(1000px) rotateY(${(1 - ease) * 45}deg) rotateX(${(1 - ease) * 15}deg) translateZ(${(1 - ease) * -200}px)`,
      };

    case 'blur-reveal':
      return {
        opacity: ease,
        transform: `scale(${0.9 + ease * 0.1})`,
        filter: `blur(${(1 - ease) * 20}px)`,
      };

    case 'expand-letter':
      return {
        opacity: ease,
        transform: 'none',
        letterSpacing: `${(1 - p) * 20}px`,
      };

    case 'strobe':
      const strobeOpacity = p < 0.9 ? (Math.sin(p * 100) > 0 ? 1 : 0.2) : 1;
      return {
        opacity: strobeOpacity,
        transform: 'none',
      };

    case 'float-drift':
      const driftX = Math.sin(p * Math.PI) * 50;
      const driftY = Math.cos(p * Math.PI) * 20;
      return {
        opacity: ease,
        transform: `translate3d(${driftX}px, ${driftY}px, 0)`,
      };

    // --- APPLE / CLEAN ---
    case 'soft-blur-up':
      return {
        opacity: easeQuart,
        transform: `translateY(${(1 - easeQuart) * 20}px)`,
        filter: `blur(${(1 - easeQuart) * 8}px)`,
      };
    case 'clean-fade-scale':
      return {
        opacity: ease,
        transform: `scale(${0.92 + ease * 0.08})`,
        filter: `blur(${(1 - ease) * 4}px)`,
      };
    case 'ios-slide-in':
      return {
        opacity: easeExpo,
        transform: `translateX(${(1 - easeExpo) * 30}px)`,
      };
    case 'cupertino-reveal':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 40}px) scale(${0.95 + ease * 0.05})`,
        letterSpacing: `${(1 - ease) * -2}px`,
      };
    case 'dynamic-island-expand': {
      const islandBounce = easeOutBack(p);
      return {
        opacity: p < 0.1 ? p * 10 : 1,
        transform: `scale(${islandBounce}) translateY(${(1 - islandBounce) * -20}px)`,
        filter: `blur(${(1 - islandBounce) * 10}px)`,
      };
    }
    case 'apple-bounce': {
      const softBounce = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 2),
        transform: `translateY(${(1 - softBounce) * -30}px)`,
      };
    }
    case 'siri-wave':
      return {
        opacity: ease,
        transform: `scale(${0.8 + ease * 0.2})`,
        filter: `hue-rotate(${p * 360}deg) blur(${(1 - ease) * 5}px)`,
      };
    case 'spotlight-reveal':
      return {
        opacity: easeExpo,
        transform: `scale(${1.2 - easeExpo * 0.2})`,
        filter: `brightness(${0.5 + easeExpo * 0.5}) contrast(${1 + (1 - easeExpo)})`,
      };

    // --- PREMIUM / APP ---
    case 'app-launch-pop': {
      const pop = easeOutElastic(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `scale(${pop})`,
      };
    }
    case 'card-entry-slide':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 100}px) scale(${0.9 + ease * 0.1})`,
      };
    case 'sheet-slide-up':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 100}%)`,
      };
    case 'modal-pop-center': {
      const modalScale = 0.5 + easeOutBack(p) * 0.5;
      return {
        opacity: ease,
        transform: `scale(${modalScale})`,
      };
    }
    case 'notification-slide':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * -50}px)`,
      };

    // --- TYPOGRAPHY ---
    case 'tracking-in-expand':
      return {
        opacity: ease,
        transform: 'none',
        letterSpacing: `${(1 - ease) * -0.5}em`,
        filter: `blur(${(1 - ease) * 4}px)`,
      };
    case 'blur-in-expand':
      return {
        opacity: ease,
        transform: 'scale(1.2)',
        filter: `blur(${(1 - ease) * 12}px)`,
      };
    case 'focus-in-expand':
      return {
        opacity: ease,
        transform: `scale(${1.2 - ease * 0.2})`,
        filter: `blur(${(1 - ease) * 8}px)`,
      };
    case 'text-focus-contract':
      return {
        opacity: ease,
        transform: 'none',
        letterSpacing: `${(1 - ease) * 10}px`,
        filter: `blur(${(1 - ease) * 8}px)`,
      };
    case 'letter-shuffling':
      const shuffleY = (Math.random() - 0.5) * (1-p) * 20;
      return {
        opacity: ease,
        transform: `translateY(${shuffleY}px)`,
      };

    // --- 3D / CREATIVE ---
    case 'skew-in-slide':
      return {
        opacity: ease,
        transform: `skewX(${(1 - ease) * -20}deg) translateX(${(1 - ease) * -40}px)`,
      };
    case 'rotate-in-down-left':
      return {
        opacity: ease,
        transform: `rotate(${(1 - ease) * -45}deg) translate(${(1 - ease) * -20}px, ${(1 - ease) * -40}px)`,
      };
    case 'wheel-spin':
      return {
        opacity: ease,
        transform: `rotateX(${(1 - ease) * 360}deg)`,
      };
    case 'jack-in-the-box':
      return {
        opacity: ease,
        transform: `scale(${0.1 + ease * 0.9}) rotate(${(1 - ease) * 30}deg)`,
      };
    case 'swing-in-top-fwd':
      return {
        opacity: ease,
        transform: `rotateX(${(1 - ease) * 100}deg) translateY(${(1 - ease) * -100}px) translateZ(${(1 - ease) * -200}px)`,
      };
    case '3d-flip-down':
      return {
        opacity: ease,
        transform: `perspective(400px) rotateX(${(1 - ease) * -90}deg)`,
      };
    case '3d-rotate-in':
      return {
        opacity: ease,
        transform: `perspective(400px) rotateY(${(1 - ease) * 90}deg)`,
      };

    // --- CYBER / GLITCH ---
    case 'cyber-glitch-2': {
      const step = Math.floor(p * 5); // 5 frames
      const offX = step % 2 === 0 ? 5 : -5;
      return {
        opacity: 1,
        transform: p < 1 ? `translateX(${offX * (1 - p)}px)` : 'none',
        clipPath: p < 1 ? `inset(${Math.random()*40}% 0 ${Math.random()*40}% 0)` : 'none',
      };
    }
    case 'pixel-reveal':
      // Hard to do real pixels without splitting structure, simulate with steps
      const pixStep = Math.floor(p * 10) / 10;
      return {
        opacity: pixStep,
        transform: 'none',
        filter: `blur(${(1-pixStep) * 4}px)`,
      };
    case 'decoder-text':
      // Simulate by opacity flicker
      return {
        opacity: Math.random() > 0.5 || p > 0.8 ? 1 : 0.3,
        transform: 'none',
      };
    case 'matrix-reveal':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * -20}px)`,
        filter: `drop-shadow(0 ${(1 - ease) * 10}px 5px #00ff00)`,
        color: p < 0.9 ? '#00ff00' : undefined,
      };
    case 'hacker-type':
       return {
         opacity: p > 0.1 ? 1 : 0,
         transform: 'none',
         filter: p < 0.8 ? 'invert(1)' : 'none',
       };

    // --- NATURE / ORGANIC ---
    case 'water-drop':
      return {
        opacity: ease,
        transform: `scale(${0.5 + ease * 0.5})`,
        filter: `blur(${(1 - ease) * 5}px) contrast(150%)`,
      };
    case 'leaf-float':
      return {
        opacity: ease,
        transform: `rotate(${(1 - ease) * 15}deg) translateY(${(1 - ease) * 30}px) translateX(${Math.sin(p * Math.PI * 2) * 10}px)`,
      };
    case 'wind-blow':
      return {
        opacity: ease,
        transform: `skewX(${(1 - ease) * 20}deg) translateX(${(1 - ease) * 50}px)`,
        filter: `blur(${(1 - ease) * 5}px)`,
      };
    case 'solar-flare':
      return {
        opacity: ease,
        transform: `scale(${1 + (1 - ease) * 0.5})`,
        filter: `brightness(${1 + (1 - ease) * 2}) sepia(${1 - ease})`,
      };
    case 'breathe':
       const breatheFn = Math.sin(p * Math.PI);
       return {
         opacity: ease,
         transform: `scale(${1 + breatheFn * 0.05})`,
       };

    // --- MODERN WEB ---
    case 'stripe-reveal':
      return {
        opacity: 1,
        transform: 'none',
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, // Same as typewriter but useful alias
      };
    case 'curtain-rise':
      return {
        opacity: 1,
        transform: 'none',
        clipPath: `inset(${(1 - p) * 100}% 0 0 0)`,
      };
    case 'smooth-ease':
      const sEase = 1 - Math.pow(1 - p, 5);
      return {
        opacity: sEase,
        transform: `translateY(${(1 - sEase) * 20}px)`,
        filter: `blur(${(1 - sEase) * 5}px)`,
      };
    case 'liquid-flow':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 30}px) scaleY(${1 + (1-ease)*0.5})`,
      };
    case 'elastic-snap':
      const snap = easeOutElastic(p);
      return {
        opacity: Math.min(1, p * 5),
        transform: `translateX(${(1 - snap) * -100}px)`,
      };

    // --- RETRO ---
    case 'retro-terminal':
      return {
        opacity: p < 0.2 ? 0 : 1,
        transform: 'none',
        filter: p < 0.9 ? 'contrast(200%) brightness(150%)' : 'none',
      };
    case 'vhs-tracking':
       const vhsShift = Math.sin(p * 20) * (1 - p) * 5;
       return {
         opacity: ease,
         transform: `translateX(${vhsShift}px)`,
         filter: `blur(${Math.abs(vhsShift)}px)`,
       };
    case '8bit-slide':
       const step8 = Math.floor(p * 8) / 8;
       return {
         opacity: step8,
         transform: `translateY(${(1 - step8) * 20}px)`,
       };
    case 'arcade-pop':
       const arcBounce = easeOutBounce(p);
       return {
         opacity: Math.min(1, p * 2),
         transform: `scale(${arcBounce}) rotate(${(1 - arcBounce) * 10}deg)`,
       };
    case 'neon-flicker':
       const flick = Math.random() > (p * 0.8) ? 0.3 : 1;
       return {
         opacity: flick,
         transform: 'none',
         filter: flick > 0.8 ? 'drop-shadow(0 0 5px #fff)' : 'none',
       };

    // --- MINIMALIST ---
    case 'minimal-fade':
      return {
         opacity: Math.pow(p, 2),
         transform: 'none',
      };
    case 'thin-slice':
      return {
        opacity: ease,
        transform: `scaleX(${p})`,
      };
    case 'simple-wipe':
      return {
        opacity: 1,
        transform: 'none',
        clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`,
      };
    case 'center-line':
       return {
         opacity: ease,
         transform: `scaleY(${p})`,
       };
    case 'border-draw':
       // Hard to draw border on text without SVG, simulate with clip
       return {
         opacity: p > 0.5 ? 1 : 0,
         transform: 'none',
         // Not real border draw but a decent placeholder
         clipPath: `inset(${(1-p)*50}% ${(1-p)*50}% ${(1-p)*50}% ${(1-p)*50}%)`,
       };

    default:
      return { opacity: 1, transform: 'translateZ(0)' };
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
  | 'wobble-3d'
  | 'reveal-zoom'
  | 'parallax-3d'
  | 'magnetic';

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
  { id: 'reveal-zoom', name: 'Reveal Zoom', icon: '🔍' },
  { id: 'parallax-3d', name: '3D Parallax', icon: '🕶️' },
  { id: 'magnetic', name: 'Magnetic', icon: '🧲' },
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
        transform: `perspective(1000px) rotateX(${wobble}deg) rotateY(${wobble}deg) translateZ(0)`,
      };
    }

    case 'reveal-zoom':
      return {
        opacity: ease,
        transform: `scale(${0.2 + ease * 0.8}) rotateX(${(1 - ease) * 45}deg) translateZ(0)`,
      };

    case 'parallax-3d':
      return {
        opacity: ease,
        transform: `perspective(1000px) rotateY(${(1 - ease) * 45}deg) translateZ(${(1 - ease) * -500}px)`,
      };

    case 'magnetic':
      return {
        opacity: ease,
        transform: `scale(${0.9 + ease * 0.1}) translateZ(${ (1 - ease) * 100 }px)`,
      };

    default:
      return { opacity: 1, transform: 'translateZ(0)' };
  }
};
