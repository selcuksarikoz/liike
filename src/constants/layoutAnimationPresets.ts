export type LayoutAnimation = {
  type: 'float' | 'bounce' | 'rotate' | 'zoom' | 'zoom-in' | 'zoom-out' | 'zoom-up' | 'zoom-down' | 'slide' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'pulse' | 'swing' | 'shake' | 'spiral' | 'fan' | 'domino' | 'elastic-rotate' | 'converge' | 'diverge' | 'glitch' | 'wobble-3d' | 'rotate-3d' | 'elevator' | 'skew-slide' | 'orbit' | 'reveal-3d' | 'float-complex' | 'pulse-3d' | 'parallax-drift' | 'reveal-zoom' | 'magnetic' | 'none' | 'camera-pan' | 'hero-float' | 'cinematic-zoom' | 'soft-drift' | 'elastic-enter' | 'stagger-fade' | 'perspective-twist' | 'depth-hover' | 'scatter' | 'wave' | 'breathe' | 'spotlight' | 'confetti' | 'scanline' | 'grain' | 'stack-drop' | 'hover' | 'search-light' | 'scan-vertical' | 'snow-fall' | 'heat-wave' | 'leaf-fall' | 'hver';
  duration: number;
  easing: string;
  intensity?: number;
  stagger?: number;
};

export type MediaPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type TextPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

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
  | 'border-draw'
  // Directional
  | 'slide-in-left'
  | 'slide-in-right'
  | 'slide-in-top'
  | 'slide-in-bottom'
  | 'reveal-left'
  | 'reveal-right'
  | 'reveal-top'
  | 'reveal-bottom'
  | 'bounce-left'
  | 'bounce-right'
  | 'bounce-top'
  | 'bounce-bottom'
  | 'elastic-left'
  | 'elastic-right'
  | 'zoom-in-left'
  | 'zoom-in-right'
  | 'fade-in-left'
  | 'fade-in-right'
  | 'blur-slide-left'
  | 'blur-slide-right'
  | 'skew-slide-left'
  | 'skew-slide-right'
  | 'float-up'
  | 'float-down'
  | 'float-left'
  | 'float-right'
  | 'none';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export const ANIMATION_SPEED_MULTIPLIERS: Record<AnimationSpeed, number> = {
  slow: 0.5,
  normal: 1,
  fast: 2,
};

// CSS transition durations based on speed
export const ANIMATION_SPEED_DURATIONS: Record<AnimationSpeed, number> = {
  slow: 1000,
  normal: 800,
  fast: 400,
};

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

  // Directional
  { id: 'slide-in-left', name: 'Slide Left', icon: '➡️', category: 'basic' },
  { id: 'slide-in-right', name: 'Slide Right', icon: '⬅️', category: 'basic' },
  { id: 'slide-in-top', name: 'Slide Top', icon: '⬇️', category: 'basic' },
  { id: 'slide-in-bottom', name: 'Slide Btm', icon: '⬆️', category: 'basic' },
  { id: 'reveal-left', name: 'Reveal Left', icon: '👈', category: 'premium' },
  { id: 'reveal-right', name: 'Reveal Right', icon: '👉', category: 'premium' },
  { id: 'reveal-top', name: 'Reveal Top', icon: '👇', category: 'premium' },
  { id: 'reveal-bottom', name: 'Reveal Btm', icon: '👆', category: 'premium' },
  { id: 'bounce-left', name: 'Bnch Left', icon: '🏀', category: 'basic' },
  { id: 'bounce-right', name: 'Bnch Right', icon: '🏀', category: 'basic' },
  { id: 'bounce-top', name: 'Bnch Top', icon: '🏀', category: 'basic' },
  { id: 'bounce-bottom', name: 'Bnch Btm', icon: '🏀', category: 'basic' },
  { id: 'elastic-left', name: 'Elast Left', icon: '🏹', category: 'basic' },
  { id: 'elastic-right', name: 'Elast Right', icon: '🏹', category: 'basic' },
  { id: 'zoom-in-left', name: 'Zoom Left', icon: '🔍', category: 'premium' },
  { id: 'zoom-in-right', name: 'Zoom Right', icon: '🔍', category: 'premium' },
  { id: 'fade-in-left', name: 'Fade Left', icon: '🌫️', category: 'basic' },
  { id: 'fade-in-right', name: 'Fade Right', icon: '🌫️', category: 'basic' },
  { id: 'blur-slide-left', name: 'Blur Left', icon: '💨', category: 'premium' },
  { id: 'blur-slide-right', name: 'Blur Right', icon: '💨', category: 'premium' },
  { id: 'skew-slide-left', name: 'Skew Left', icon: '📐', category: 'creative' },
  { id: 'skew-slide-right', name: 'Skew Right', icon: '📐', category: 'creative' },
  { id: 'float-up', name: 'Float Up', icon: '☁️', category: 'apple' },
  { id: 'float-down', name: 'Float Down', icon: '☁️', category: 'apple' },
  { id: 'float-left', name: 'Float Left', icon: '☁️', category: 'apple' },
  { id: 'float-right', name: 'Float Right', icon: '☁️', category: 'apple' },
];

export const generateTextKeyframes = (
  type: TextAnimationType,
  progress: number
): { opacity: number; transform: string; filter?: string; clipPath?: string; letterSpacing?: string; backgroundPosition?: string; backgroundImage?: string; color?: string; backgroundClip?: string; WebkitBackgroundClip?: string; willChange?: string; } => {
  const p = Math.min(1, Math.max(0, progress));
  const ease = easeOutCubic(p);
  const easeExpo = easeOutExpo(p);
  const easeQuart = easeOutQuart(p);

  // Common reduced motion/performance check could go here
  // For now, we enforce GPU compositing
  const gpu = 'translateZ(0)';

  switch (type) {
    // --- APPLE STYLE ANIMATIONS ---
    case 'apple-reveal':
      return {
        opacity: easeQuart,
        transform: `translateY(${(1 - easeQuart) * 30}px) scale(${0.98 + easeQuart * 0.02}) ${gpu}`,
        filter: `blur(${(1 - easeQuart) * 5}px)`, // Reduced blur
        willChange: 'transform, opacity, filter',
      };
      
    case 'hero-text':
      return {
        opacity: easeExpo,
        transform: `scale(${1.1 - easeExpo * 0.1}) translateY(${(1 - easeExpo) * 20}px) ${gpu}`,
        filter: `blur(${(1 - easeExpo) * 2}px)`, // Reduced blur
        willChange: 'transform, opacity, filter',
      };

    case 'gradient-flow':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 10}px) ${gpu}`,
        // Removed heavy saturate/brightness animations
        willChange: 'transform, opacity',
      };

    case 'cinematic-fade':
      return {
        opacity: p < 0.2 ? p * 5 : 1,
        transform: `translateY(${(1 - easeQuart) * 15}px) scale(${1.05 - easeQuart * 0.05}) ${gpu}`, // Use scale instead of letter-spacing
        filter: `blur(${(1 - p) * 3}px)`,
        willChange: 'transform, opacity, filter',
      };

    // --- STANDARD ANIMATIONS ---
    case 'fade':
      return {
        opacity: ease,
        transform: `none`,
      };

    case 'slide-up':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 40}px) ${gpu}`,
      };

    case 'slide-down':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * -40}px) ${gpu}`,
      };

    case 'scale':
      return {
        opacity: ease,
        transform: `scale(${0.7 + ease * 0.3}) ${gpu}`,
      };

    case 'blur':
      return {
        opacity: ease,
        transform: `scale(${0.98 + ease * 0.02}) ${gpu}`,
        filter: `blur(${(1 - ease) * 6}px)`,
      };

    case 'bounce': {
      const bounceEase = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateY(${(1 - bounceEase) * -60}px) scale(${0.8 + bounceEase * 0.2})`, // No GPU on bounce usually ok, but can add
      };
    }

    case 'typewriter':
      return {
        opacity: 1,
        transform: 'none',
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
      };

    case 'glitch': {
      // Simplified glitch math
      const glitchOffset = p < 0.9 ? Math.sin(p * 20) * (1 - p) * 2 : 0;
      return {
        opacity: p < 0.1 ? p * 10 : 1,
        transform: `translateX(${glitchOffset}px) skewX(${glitchOffset}deg) ${gpu}`,
        filter: p < 0.8 ? `hue-rotate(${(1 - p) * 45}deg)` : 'none', // Reduced hue rotation frequency
      };
    }

    case 'wave': {
      const waveY = Math.sin(p * Math.PI * 2) * (1 - p) * 20;
      return {
        opacity: ease,
        transform: `translateY(${waveY}px) rotate(${(1 - ease) * 5}deg) ${gpu}`,
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
        transform: `scale(${zoomScale}) ${gpu}`,
        filter: `blur(${(1 - ease) * 10}px)`, // Reduced from 15
        willChange: 'transform, opacity, filter',
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
        filter: `brightness(${1 + Math.sin(p * Math.PI * 2) * 0.3})`, // Reduced freq and intensity
      };

    case 'glitch-rgb':
      const gOffset = Math.sin(p * 20) * (1 - p) * 5; // Reduced frequency and offset
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
        transform: `perspective(1000px) rotateY(${(1 - ease) * 45}deg) rotateX(${(1 - ease) * 15}deg) translateZ(${(1 - ease) * -100}px)`,
      };

    case 'blur-reveal':
      return {
        opacity: ease,
        transform: `scale(${0.95 + ease * 0.05}) ${gpu}`,
        filter: `blur(${(1 - ease) * 10}px)`, // Reduced from 20
        willChange: 'transform, opacity, filter',
      };

    case 'expand-letter':
      return {
        opacity: ease,
        transform: `scaleX(${0.5 + ease * 0.5}) ${gpu}`, // Use scaleX instead of letter-spacing
        // letterSpacing: removed
        willChange: 'transform, opacity',
      };

    case 'strobe':
      const strobeOpacity = p < 0.9 ? (Math.sin(p * 50) > 0 ? 1 : 0.2) : 1; // Reduced freq
      return {
        opacity: strobeOpacity,
        transform: 'none',
      };

    case 'float-drift':
      const driftX = Math.sin(p * Math.PI) * 30;
      const driftY = Math.cos(p * Math.PI) * 10;
      return {
        opacity: ease,
        transform: `translate3d(${driftX}px, ${driftY}px, 0)`,
      };

    // --- APPLE / CLEAN ---
    case 'soft-blur-up':
      return {
        opacity: easeQuart,
        transform: `translateY(${(1 - easeQuart) * 20}px) ${gpu}`,
        filter: `blur(${(1 - easeQuart) * 5}px)`, // Reduced from 8
      };
    case 'clean-fade-scale':
      return {
        opacity: ease,
        transform: `scale(${0.96 + ease * 0.04}) ${gpu}`,
        filter: `blur(${(1 - ease) * 3}px)`,
      };
    case 'ios-slide-in':
      return {
        opacity: easeExpo,
        transform: `translateX(${(1 - easeExpo) * 30}px) ${gpu}`,
      };
    case 'cupertino-reveal':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 30}px) scale(${0.98 + ease * 0.02}) ${gpu}`,
        // letterSpacing removed
      };
    case 'dynamic-island-expand': {
      const islandBounce = easeOutBack(p);
      return {
        opacity: p < 0.1 ? p * 10 : 1,
        transform: `scale(${islandBounce}) translateY(${(1 - islandBounce) * -20}px) ${gpu}`,
        filter: `blur(${(1 - islandBounce) * 5}px)`, // Reduced from 10
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
        transform: `scale(${0.8 + ease * 0.2}) ${gpu}`,
        filter: `blur(${(1 - ease) * 4}px)`, // Removed hue-rotate for perf
      };
    case 'spotlight-reveal':
      return {
        opacity: easeExpo,
        transform: `scale(${1.2 - easeExpo * 0.2}) ${gpu}`,
        filter: `brightness(${0.5 + easeExpo * 0.5})`, // Removed contrast
      };

    // --- PREMIUM / APP ---
    case 'app-launch-pop': {
      const pop = easeOutElastic(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `scale(${pop}) translateZ(0)`,
      };
    }
    case 'card-entry-slide':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 80}px) scale(${0.95 + ease * 0.05}) ${gpu}`,
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
        transform: `scale(${modalScale}) ${gpu}`,
      };
    }
    case 'notification-slide':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * -50}px) ${gpu}`,
      };

    // --- TYPOGRAPHY ---
    case 'tracking-in-expand':
      return {
        opacity: ease,
        transform: `scaleX(${0.8 + ease * 0.2}) ${gpu}`, // Fake tracking with scale
        filter: `blur(${(1 - ease) * 4}px)`,
        // letterSpacing removed
      };
    case 'blur-in-expand':
      return {
        opacity: ease,
        transform: 'scale(1.1)',
        filter: `blur(${(1 - ease) * 8}px)`, // Reduced from 12
      };
    case 'focus-in-expand':
      return {
        opacity: ease,
        transform: `scale(${1.1 - ease * 0.1})`,
        filter: `blur(${(1 - ease) * 6}px)`,
      };
    case 'text-focus-contract':
      return {
        opacity: ease,
        transform: `scaleX(${1.2 - ease * 0.2}) ${gpu}`, // Fake tracking with scale
        // letterSpacing removed
        filter: `blur(${(1 - ease) * 5}px)`,
      };
    case 'letter-shuffling':
      const shuffleY = (Math.random() - 0.5) * (1-p) * 10;
      return {
        opacity: ease,
        transform: `translateY(${shuffleY}px) ${gpu}`,
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

    // --- DIRECTIONAL / POSITIONAL ---
    case 'slide-in-left':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * -100}px)`,
      };
    case 'slide-in-right':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * 100}px)`,
      };
    case 'slide-in-top':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * -100}px)`,
      };
    case 'slide-in-bottom':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 100}px)`,
      };

    case 'reveal-left':
      return {
        opacity: 1,
        transform: 'none',
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
      };
    case 'reveal-right':
      return {
        opacity: 1,
        transform: 'none',
        clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`,
      };
    case 'reveal-top':
      return {
        opacity: 1,
        transform: 'none',
        clipPath: `inset(0 0 ${(1 - p) * 100}% 0)`,
      };
    case 'reveal-bottom':
      return {
        opacity: 1,
        transform: 'none',
        clipPath: `inset(${(1 - p) * 100}% 0 0 0)`,
      };

    case 'bounce-left': {
      const bEase = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateX(${(1 - bEase) * -100}px)`,
      };
    }
    case 'bounce-right': {
      const bEase = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateX(${(1 - bEase) * 100}px)`,
      };
    }
    case 'bounce-top': {
      const bEase = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateY(${(1 - bEase) * -100}px)`,
      };
    }
    case 'bounce-bottom': {
      const bEase = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateY(${(1 - bEase) * 100}px)`,
      };
    }

    case 'elastic-left': {
      const elEase = easeOutElastic(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateX(${(1 - elEase) * -150}px)`,
      };
    }
    case 'elastic-right': {
      const elEase = easeOutElastic(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateX(${(1 - elEase) * 150}px)`,
      };
    }

    case 'zoom-in-left':
      return {
        opacity: ease,
        transform: `scale(${0.5 + ease * 0.5}) translateX(${(1 - ease) * -100}%)`,
      };
    case 'zoom-in-right':
      return {
        opacity: ease,
        transform: `scale(${0.5 + ease * 0.5}) translateX(${(1 - ease) * 100}%)`,
      };

    case 'fade-in-left':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * -20}px)`,
      };
    case 'fade-in-right':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * 20}px)`,
      };

    case 'blur-slide-left':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * -50}px) scale(${0.9 + ease * 0.1})`,
        filter: `blur(${(1 - ease) * 10}px)`,
      };
    case 'blur-slide-right':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * 50}px) scale(${0.9 + ease * 0.1})`,
        filter: `blur(${(1 - ease) * 10}px)`,
      };

    case 'skew-slide-left':
      return {
        opacity: ease,
        transform: `skewX(${(1 - ease) * 30}deg) translateX(${(1 - ease) * -100}px)`,
      };
    case 'skew-slide-right':
      return {
        opacity: ease,
        transform: `skewX(${(1 - ease) * -30}deg) translateX(${(1 - ease) * 100}px)`,
      };

    case 'float-up':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 20}px)`,
      };
    case 'float-down':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * -20}px)`,
      };
    case 'float-left':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * 20}px)`,
      };
    case 'float-right':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * -20}px)`,
      };

    default:
      return { opacity: 1, transform: 'translateZ(0)' };
  }
};

export type DeviceConfig = {
  type: string;
  position: MediaPosition;
  scale: number;
  offsetX: number; // percentage
  offsetY: number;
  animation: string; // entry animation type
  animateIn: boolean;
};

export type TextConfig = {
  enabled: boolean;
  headline: string;
  tagline: string;
  animation: TextAnimationType;
  position: TextPosition;
  headlineFontSize: number;
  taglineFontSize: number;
  fontFamily: string;
  color: string;
};

export type LayoutPreset = {
  id: string;
  name: string;
  icon: string;
  color: string;
  durationMs: number;
  // Layout animation
  animations: LayoutAnimation[];
  // 3D rotation
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  backgroundGradient: string;
  // Device positioning & animation
  device?: Partial<DeviceConfig>;
  // Text overlay (if present, this is a "text animation" preset)
  text?: Partial<TextConfig>;
  // Category for filtering
  category?: 'layout' | 'text' | 'creative' | 'mockup';
};

// Default configs
export const DEFAULT_DEVICE_CONFIG: DeviceConfig = {
  type: 'iphone-16-pro',
  position: 'center',
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  animation: 'none',
  animateIn: false,
};

export const DEFAULT_TEXT_CONFIG: TextConfig = {
  enabled: false,
  headline: '',
  tagline: '',
  animation: 'none',
  position: 'top-center',
  headlineFontSize: 64,
  taglineFontSize: 24,
  fontFamily: 'Manrope',
  color: '#ffffff',
};

export const LAYOUT_PRESETS: LayoutPreset[] = [
  // --- ESSENTIALS (CLEAN & SIMPLE) ---
  {
    id: 'clean-zoom-in',
    name: 'Clean Zoom In',
    icon: 'magnifying-glass-plus',
    color: '#3B82F6',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-50 to-slate-200',
    animations: [{ type: 'zoom-in', duration: 4000, easing: 'ease-out', intensity: 1.1, stagger: 0.2 }],
    device: { animation: 'fade', animateIn: true, scale: 0.9 },
    category: 'layout',
  },
  {
    id: 'clean-zoom-out',
    name: 'Clean Zoom Out',
    icon: 'magnifying-glass-minus',
    color: '#60A5FA',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-100 to-white',
    animations: [{ type: 'zoom-out', duration: 4000, easing: 'ease-out', intensity: 1.1, stagger: 0.2 }],
    device: { animation: 'fade', animateIn: true, scale: 0.95 },
    category: 'layout',
  },
  {
    id: 'clean-fade-up',
    name: 'Fade Up',
    icon: 'arrow-up',
    color: '#94A3B8',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-gray-50 to-gray-100',
    animations: [{ type: 'slide-up', duration: 1500, easing: 'ease-out', intensity: 20, stagger: 0.15 }],
    device: { animation: 'rise', animateIn: true, scale: 0.9 },
    category: 'layout',
  },
  {
    id: 'soft-float',
    name: 'Soft Float',
    icon: 'cloud',
    color: '#A78BFA',
    durationMs: 5000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-indigo-50 to-blue-50',
    animations: [{ type: 'float', duration: 5000, easing: 'ease-in-out', intensity: 15, stagger: 0.3 }],
    device: { animation: 'fade', animateIn: true, scale: 0.9 },
    category: 'layout',
  },

  // --- DIRECTIONAL (SLIDES) ---
  {
    id: 'slide-from-left',
    name: 'Slide Right',
    icon: 'arrow-right',
    color: '#F59E0B',
    durationMs: 3500,
    rotationX: 0,
    rotationY: 5,
    rotationZ: 0,
    backgroundGradient: 'from-amber-50 to-orange-50',
    animations: [{ type: 'slide-right', duration: 1000, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', intensity: 100, stagger: 0.1 }],
    device: { animation: 'slide-right', animateIn: true, scale: 0.85 },
    category: 'layout',
  },
  {
    id: 'slide-from-right',
    name: 'Slide Left',
    icon: 'arrow-left',
    color: '#F59E0B',
    durationMs: 3500,
    rotationX: 0,
    rotationY: -5,
    rotationZ: 0,
    backgroundGradient: 'from-orange-50 to-amber-50',
    animations: [{ type: 'slide-left', duration: 1000, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', intensity: 100, stagger: 0.1 }],
    device: { animation: 'slide-left', animateIn: true, scale: 0.85 },
    category: 'layout',
  },
  {
    id: 'slide-drop-in',
    name: 'Drop In',
    icon: 'arrow-down',
    color: '#EF4444',
    durationMs: 3000,
    rotationX: 10,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-red-50 to-rose-100',
    animations: [{ type: 'slide-down', duration: 800, easing: 'ease-out', intensity: 50, stagger: 0.15 }],
    device: { animation: 'drop', animateIn: true, scale: 0.9 },
    category: 'layout',
  },
  {
    id: 'slide-rise-up',
    name: 'Rise Up',
    icon: 'arrow-up',
    color: '#10B981',
    durationMs: 3000,
    rotationX: -10,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-green-50 to-emerald-100',
    animations: [{ type: 'slide-up', duration: 800, easing: 'ease-out', intensity: 50, stagger: 0.15 }],
    device: { animation: 'rise', animateIn: true, scale: 0.9 },
    category: 'layout',
  },
  {
    id: 'corner-top-left',
    name: 'From Top Left',
    icon: 'arrow-down-right',
    color: '#6366F1',
    durationMs: 3500,
    rotationX: 5,
    rotationY: 5,
    rotationZ: 0,
    backgroundGradient: 'from-indigo-50 to-blue-100',
    animations: [{ type: 'slide-right', duration: 1000, easing: 'ease-out', intensity: 50, stagger: 0.1 }], // simulated corner
    device: { animation: 'swing-in', animateIn: true, scale: 0.85 },
    category: 'layout',
  },
  {
    id: 'corner-top-right',
    name: 'From Top Right',
    icon: 'arrow-down-left',
    color: '#8B5CF6',
    durationMs: 3500,
    rotationX: 5,
    rotationY: -5,
    rotationZ: 0,
    backgroundGradient: 'from-violet-50 to-purple-100',
    animations: [{ type: 'slide-left', duration: 1000, easing: 'ease-out', intensity: 50, stagger: 0.1 }],
    device: { animation: 'swing-in', animateIn: true, scale: 0.85 },
    category: 'layout',
  },
  {
    id: 'elastic-left-entry',
    name: 'Elastic Left',
    icon: 'chevrons-right',
    color: '#EC4899',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 10,
    rotationZ: 0,
    backgroundGradient: 'from-pink-50 to-rose-100',
    animations: [{ type: 'elastic-enter', duration: 1500, easing: 'elastic', intensity: 100, stagger: 0.1 }],
    device: { animation: 'slide-right', animateIn: true, scale: 0.85 },
    category: 'creative',
  },
  {
    id: 'elastic-right-entry',
    name: 'Elastic Right',
    icon: 'chevrons-left',
    color: '#F43F5E',
    durationMs: 4000,
    rotationX: 0,
    rotationY: -10,
    rotationZ: 0,
    backgroundGradient: 'from-rose-50 to-red-100',
    animations: [{ type: 'elastic-enter', duration: 1500, easing: 'elastic', intensity: -100, stagger: 0.1 }],
    device: { animation: 'slide-left', animateIn: true, scale: 0.85 },
    category: 'creative',
  },

  // --- POP & BOUNCE (DYNAMIC) ---
  {
    id: 'bouncy-pop',
    name: 'Bouncy Pop',
    icon: 'party-popper',
    color: '#EC4899',
    durationMs: 3000,
    rotationX: 5,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-pink-100 to-rose-200',
    animations: [{ type: 'bounce', duration: 1000, easing: 'ease-out', intensity: 1.5, stagger: 0.1 }],
    device: { animation: 'bounce-in', animateIn: true, scale: 0.85 },
    category: 'creative',
  },
  {
    id: 'elastic-rise',
    name: 'Elastic Rise',
    icon: 'spring',
    color: '#10B981',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-emerald-50 to-teal-100',
    animations: [{ type: 'slide-up', duration: 1200, easing: 'elastic', intensity: 30, stagger: 0.15 }],
    device: { animation: 'rise', animateIn: true, scale: 0.85 },
    category: 'creative',
  },

  // --- PREMIUM & CINEMATIC ---
  {
    id: 'premium-reveal',
    name: 'Premium Reveal',
    icon: 'sparkles',
    color: '#FBBF24',
    durationMs: 4500,
    rotationX: 5,
    rotationY: -5,
    rotationZ: 0,
    backgroundGradient: 'from-slate-900 via-slate-800 to-black',
    animations: [{ type: 'zoom-out', duration: 2500, easing: 'ease-out', intensity: 1.15, stagger: 0.2 }],
    device: { animation: 'tilt-reveal', animateIn: true, scale: 0.8 },
    category: 'creative',
  },
  {
    id: 'cinematic-drift',
    name: 'Cinematic Drift',
    icon: 'film',
    color: '#8B5CF6',
    durationMs: 6000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: -2,
    backgroundGradient: 'from-zinc-900 via-black to-zinc-900',
    animations: [{ type: 'float-complex', duration: 6000, easing: 'ease-in-out', intensity: 10, stagger: 0.4 }],
    device: { animation: 'fade', animateIn: true, scale: 0.9 },
    category: 'layout',
  },
  {
    id: 'studio-clean',
    name: 'Studio Clean',
    icon: 'camera',
    color: '#6366F1',
    durationMs: 4000,
    rotationX: 10,
    rotationY: 10,
    rotationZ: 0,
    backgroundGradient: 'from-gray-100 to-gray-200',
    animations: [{ type: 'wobble-3d', duration: 4000, easing: 'ease-in-out', intensity: 2, stagger: 0.2 }],
    device: { animation: 'rotate-in', animateIn: true, scale: 0.85 },
    category: 'mockup',
  },

  // --- CREATIVE 3D ---
  {
    id: 'isometric-view',
    name: 'Isometric',
    icon: 'cube',
    color: '#10B981',
    durationMs: 4000,
    rotationX: 25,
    rotationY: -25,
    rotationZ: 10,
    backgroundGradient: 'from-teal-500 via-emerald-600 to-green-700',
    animations: [{ type: 'slide-up', duration: 1000, easing: 'ease-out', intensity: 40, stagger: 0.2 }],
    device: { animation: 'rise', animateIn: true, scale: 0.75 },
    category: 'mockup',
  },
  {
    id: 'spiral-showcase',
    name: 'Spiral',
    icon: 'hurricane',
    color: '#8B5CF6',
    durationMs: 4500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-violet-600 via-purple-700 to-fuchsia-800',
    animations: [{ type: 'spiral', duration: 1500, easing: 'ease-out', intensity: 180, stagger: 0.15 }],
    device: { animation: 'spiral-in', animateIn: true, scale: 0.8 },
    category: 'creative',
  },
  {
    id: 'fan-deck',
    name: 'Fan Deck',
    icon: 'cards',
    color: '#06B6D4',
    durationMs: 4000,
    rotationX: 10,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-cyan-500 via-blue-600 to-indigo-900',
    animations: [{ type: 'fan', duration: 1200, easing: 'ease-out', intensity: 25, stagger: 0.1 }],
    device: { animation: 'spiral-in', animateIn: true, scale: 0.8 },
    category: 'creative',
  },
  {
    id: 'orbit-flow',
    name: 'Orbit Flow',
    icon: 'planet',
    color: '#A855F7',
    durationMs: 5000,
    rotationX: 15,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-purple-900 via-fuchsia-900 to-black',
    animations: [{ type: 'orbit', duration: 5000, easing: 'linear', intensity: 30, stagger: 0.2 }],
    device: { animation: 'reveal-zoom', animateIn: true, scale: 0.8 },
    category: 'creative',
  },

  // --- TEXT FOCUSED (Kept as specific use cases) ---
  {
    id: 'text-intro',
    name: 'Text Intro',
    icon: 'type',
    color: '#ffffff',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-black via-zinc-900 to-black',
    animations: [{ type: 'zoom-in', duration: 3000, easing: 'ease-out', intensity: 1.05, stagger: 0.1 }],
    device: { animation: 'rise', animateIn: true, scale: 0.75, offsetY: 25 },
    text: { enabled: true, headline: 'Showcase', tagline: 'Your masterpiece.', animation: 'blur', position: 'top-center' },
    category: 'text',
  },
  {
    id: 'text-impact',
    name: 'Text Impact',
    icon: 'lightning',
    color: '#ffffff',
    durationMs: 3000,
    rotationX: 10,
    rotationY: -5,
    rotationZ: 0,
    backgroundGradient: 'from-red-900 via-black to-black',
    animations: [{ type: 'zoom-out', duration: 800, easing: 'ease-out', intensity: 1.2, stagger: 0.1 }],
    device: { animation: 'bounce-in', animateIn: true, scale: 0.8 },
    text: { enabled: true, headline: 'IMPACT', tagline: 'Make it count.', animation: 'elastic', position: 'center' },
    category: 'text',
  }
  ,
  // --- NORDIC / MINIMAL ---
  {
    id: 'nordic-air',
    name: 'Nordic Air',
    icon: 'wind',
    color: '#E2E8F0',
    durationMs: 5000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-50 via-slate-100 to-white',
    animations: [{ type: 'soft-drift', duration: 5000, easing: 'ease-in-out', intensity: 5, stagger: 0.5 }],
    device: { animation: 'fade', animateIn: true, scale: 0.9 },
    category: 'layout',
  },
  {
    id: 'finnish-mist',
    name: 'Finnish Mist',
    icon: 'cloud-fog',
    color: '#CBD5E1',
    durationMs: 4500,
    rotationX: 5,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-gray-100 via-zinc-100 to-stone-100',
    animations: [{ type: 'zoom-in', duration: 4500, easing: 'ease-out', intensity: 1.05, stagger: 0.2 }],
    device: { animation: 'rise', animateIn: true, scale: 0.85 },
    category: 'layout',
  },
  {
    id: 'copenhagen-clean',
    name: 'Copenhagen',
    icon: 'store',
    color: '#94A3B8',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 10,
    rotationZ: 0,
    backgroundGradient: 'from-white via-slate-50 to-white',
    animations: [{ type: 'slide-up', duration: 1200, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', intensity: 30, stagger: 0.1 }],
    device: { animation: 'parallax-3d', animateIn: true, scale: 0.8 },
    category: 'layout',
  },
  {
    id: 'arctic-white',
    name: 'Arctic',
    icon: 'snowflake',
    color: '#F8FAFC',
    durationMs: 4000,
    rotationX: 2,
    rotationY: -2,
    rotationZ: 0,
    backgroundGradient: 'from-sky-50 to-white',
    animations: [{ type: 'float', duration: 4000, easing: 'ease-in-out', intensity: 8, stagger: 0.3 }],
    device: { animation: 'fade', animateIn: true, scale: 0.95 },
    category: 'layout',
  },
  {
    id: 'stockholm-studio',
    name: 'Stockholm',
    icon: 'camera-movie',
    color: '#475569',
    durationMs: 5000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-gray-50 to-slate-200',
    animations: [{ type: 'camera-pan', duration: 5000, easing: 'linear', intensity: 10, stagger: 0 }],
    device: { animation: 'zoom-in', animateIn: true, scale: 0.9 },
    category: 'mockup',
  },
  
  // --- NATURE / ORGANIC ---
  {
    id: 'forest-canopy',
    name: 'Canopy',
    icon: 'tree-pine',
    color: '#059669',
    durationMs: 5000,
    rotationX: 10,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-green-50 to-emerald-100',
    animations: [{ type: 'float-complex', duration: 5000, easing: 'ease-in-out', intensity: 12, stagger: 0.4 }],
    device: { animation: 'rise', animateIn: true, scale: 0.85 },
    category: 'creative',
  },
  {
    id: 'ocean-depth',
    name: 'Deep Ocean',
    icon: 'waves',
    color: '#0369A1',
    durationMs: 6000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-cyan-900 via-blue-900 to-slate-900',
    animations: [{ type: 'depth-hover', duration: 6000, easing: 'ease-in-out', intensity: 20, stagger: 0.3 }],
    device: { animation: 'fade', animateIn: true, scale: 0.8 },
    category: 'creative',
  },
  {
    id: 'desert-dune',
    name: 'Dunes',
    icon: 'mountain',
    color: '#D97706',
    durationMs: 5000,
    rotationX: 15,
    rotationY: 5,
    rotationZ: -2,
    backgroundGradient: 'from-orange-100 via-amber-100 to-yellow-50',
    animations: [{ type: 'soft-drift', duration: 5000, easing: 'ease-in-out', intensity: 15, stagger: 0.2 }],
    device: { animation: 'tilt-reveal', animateIn: true, scale: 0.8 },
    category: 'layout',
  },
  {
    id: 'alpine-rise',
    name: 'Alpine',
    icon: 'mountain-snow',
    color: '#3B82F6',
    durationMs: 4000,
    rotationX: -5,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-indigo-50 to-white',
    animations: [{ type: 'slide-up', duration: 2000, easing: 'active', intensity: 50, stagger: 0.1 }],
    device: { animation: 'rise', animateIn: true, scale: 0.9 },
    category: 'layout',
  },
  {
    id: 'savanna-sun',
    name: 'Savanna',
    icon: 'sun',
    color: '#F59E0B',
    durationMs: 4500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-yellow-100 via-orange-100 to-red-50',
    animations: [{ type: 'zoom-in', duration: 4500, easing: 'ease-out', intensity: 1.1, stagger: 0.1 }],
    device: { animation: 'fade', animateIn: true, scale: 0.85 },
    category: 'creative',
  },
  {
    id: 'rainforest-mist',
    name: 'Rainforest',
    icon: 'droplets',
    color: '#10B981',
    durationMs: 5000,
    rotationX: 5,
    rotationY: 5,
    rotationZ: 0,
    backgroundGradient: 'from-teal-900 to-emerald-900',
    animations: [{ type: 'float', duration: 3000, easing: 'ease-in-out', intensity: 10, stagger: 0.2 }],
    device: { animation: 'reveal-zoom', animateIn: true, scale: 0.8 },
    category: 'creative',
  },

  // --- COSMIC / SPACE ---
  {
    id: 'nebula-drift',
    name: 'Nebula',
    icon: 'sparkles',
    color: '#8B5CF6',
    durationMs: 8000,
    rotationX: 10,
    rotationY: 10,
    rotationZ: 5,
    backgroundGradient: 'from-purple-900 via-indigo-900 to-black',
    animations: [{ type: 'float-complex', duration: 8000, easing: 'linear', intensity: 20, stagger: 0.5 }],
    device: { animation: 'fade', animateIn: true, scale: 0.75 },
    category: 'creative',
  },
  {
    id: 'quasar-pulse',
    name: 'Quasar',
    icon: 'activity',
    color: '#EF4444',
    durationMs: 2000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-red-900 to-black',
    animations: [{ type: 'pulse-3d', duration: 2000, easing: 'ease-in-out', intensity: 1.05, stagger: 0.1 }],
    device: { animation: 'zoom-in', animateIn: true, scale: 0.8 },
    category: 'creative',
  },
  {
    id: 'gravity-well',
    name: 'Gravity',
    icon: 'magnet',
    color: '#6366F1',
    durationMs: 4000,
    rotationX: 20,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-900 to-black',
    animations: [{ type: 'converge', duration: 4000, easing: 'ease-in-out', intensity: 50, stagger: 0.1 }],
    device: { animation: 'magnetic', animateIn: true, scale: 0.8 },
    category: 'creative',
  },
  {
    id: 'orbital-ring',
    name: 'Orbital',
    icon: 'circle-dashed',
    color: '#A855F7',
    durationMs: 6000,
    rotationX: 15,
    rotationY: 0,
    rotationZ: 15,
    backgroundGradient: 'from-fuchsia-900 via-purple-900 to-black',
    animations: [{ type: 'orbit', duration: 6000, easing: 'linear', intensity: 20, stagger: 0.2 }],
    device: { animation: 'reveal-zoom', animateIn: true, scale: 0.7 },
    category: 'creative',
  },
  {
    id: 'star-field',
    name: 'Star Field',
    icon: 'stars',
    color: '#FFF',
    durationMs: 10000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'bg-black',
    animations: [{ type: 'zoom-in', duration: 10000, easing: 'linear', intensity: 1.5, stagger: 0.5 }],
    device: { animation: 'fade', animateIn: true, scale: 0.8 },
    category: 'creative',
  },

  // --- URBAN / STREET ---
  {
    id: 'tokyo-neon',
    name: 'Tokyo Neon',
    icon: 'zap',
    color: '#EC4899',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 20,
    rotationZ: 0,
    backgroundGradient: 'from-pink-900 via-purple-900 to-slate-900',
    animations: [{ type: 'glitch', duration: 3000, easing: 'steps(5)', intensity: 10, stagger: 0.1 }],
    device: { animation: 'slide-right', animateIn: true, scale: 0.85 },
    category: 'creative',
  },
  {
    id: 'berlin-concrete',
    name: 'Berlin',
    icon: 'building',
    color: '#64748B',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-400 via-gray-400 to-zinc-400',
    animations: [{ type: 'slide-up', duration: 1000, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', intensity: 50, stagger: 0.05 }],
    device: { animation: 'rise', animateIn: true, scale: 0.9 },
    category: 'layout',
  },
  {
    id: 'nyc-grid',
    name: 'NYC Grid',
    icon: 'layout-grid',
    color: '#334155',
    durationMs: 4000,
    rotationX: 5,
    rotationY: -5,
    rotationZ: 0,
    backgroundGradient: 'from-slate-100 to-gray-200',
    animations: [{ type: 'stagger-fade', duration: 1500, easing: 'ease-out', intensity: 20, stagger: 0.1 }],
    device: { animation: 'zoom-in', animateIn: true, scale: 0.85 },
    category: 'layout',
  },
  {
    id: 'cyber-punk',
    name: 'Cyberpunk',
    icon: 'cpu',
    color: '#FACC15',
    durationMs: 3000,
    rotationX: 10,
    rotationY: 0,
    rotationZ: 5,
    backgroundGradient: 'from-yellow-400 via-yellow-600 to-black',
    animations: [{ type: 'skew-slide', duration: 800, easing: 'active', intensity: 20, stagger: 0.05 }],
    device: { animation: 'wobble-3d', animateIn: true, scale: 0.8 },
    category: 'creative',
  },

  // --- GLASS / CRYSTAL ---
  {
    id: 'frosted-glass',
    name: 'Frosted',
    icon: 'mouse-pointer-2',
    color: '#A7F3D0',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-emerald-50 via-teal-50 to-cyan-50',
    animations: [{ type: 'blur-reveal', duration: 2000, easing: 'ease-out', intensity: 10, stagger: 0.2 }],
    device: { animation: 'fade', animateIn: true, scale: 0.9 },
    category: 'layout',
  },
  {
    id: 'prism-refract',
    name: 'Prism',
    icon: 'triangle',
    color: '#F472B6',
    durationMs: 4000,
    rotationX: 15,
    rotationY: 15,
    rotationZ: 0,
    backgroundGradient: 'from-pink-100 via-purple-100 to-indigo-100',
    animations: [{ type: 'rotate-3d', duration: 4000, easing: 'ease-in-out', intensity: 15, stagger: 0.2 }],
    device: { animation: 'tilt-reveal', animateIn: true, scale: 0.8 },
    category: 'creative',
  },
  {
    id: 'crystal-clear',
    name: 'Crystal',
    icon: 'diamond',
    color: '#38BDF8',
    durationMs: 5000,
    rotationX: 5,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-sky-50 to-blue-100',
    animations: [{ type: 'cinematic-zoom', duration: 5000, easing: 'ease-out', intensity: 1.05, stagger: 0.1 }],
    device: { animation: 'zoom-in', animateIn: true, scale: 0.85 },
    category: 'layout',
  },

  // --- TECH / MODERN ---
  {
    id: 'silicon-valley',
    name: 'Silicon',
    icon: 'microchip',
    color: '#6366F1',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-gray-50 to-gray-100',
    animations: [{ type: 'slide-up', duration: 1000, easing: 'ease-out', intensity: 30, stagger: 0.1 }],
    device: { animation: 'rise', animateIn: true, scale: 0.9 },
    category: 'layout',
  },
  {
    id: 'quantum-state',
    name: 'Quantum',
    icon: 'atom',
    color: '#8B5CF6',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-violet-50 to-white',
    animations: [{ type: 'elastic-enter', duration: 2000, easing: 'elastic', intensity: 1.2, stagger: 0.1 }],
    device: { animation: 'bounce-in', animateIn: true, scale: 0.85 },
    category: 'creative',
  },
  {
    id: 'hero-grid',
    name: 'Hero Grid',
    icon: 'layout-template',
    color: '#475569',
    durationMs: 4000,
    rotationX: 20,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-100 to-slate-200',
    animations: [{ type: 'perspective-twist', duration: 4000, easing: 'ease-in-out', intensity: 10, stagger: 0.1 }],
    device: { animation: 'tilt-reveal', animateIn: true, scale: 0.8 },
    category: 'mockup',
  },

  // --- ABSTRACT / ART ---
  {
    id: 'geometric-chaos',
    name: 'Chaos',
    icon: 'shapes',
    color: '#F43F5E',
    durationMs: 3500,
    rotationX: 10,
    rotationY: 10,
    rotationZ: 10,
    backgroundGradient: 'from-rose-100 to-orange-100',
    animations: [{ type: 'scatter', duration: 1500, easing: 'ease-out', intensity: 100, stagger: 0.1 } as any],
    device: { animation: 'wobble-3d', animateIn: true, scale: 0.75 },
    category: 'creative',
  },
  {
    id: 'ordered-flux',
    name: 'Flux',
    icon: 'git-merge',
    color: '#0EA5E9',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 5,
    rotationZ: 0,
    backgroundGradient: 'from-sky-100 to-blue-100',
    animations: [{ type: 'wave', duration: 4000, easing: 'ease-in-out', intensity: 20, stagger: 0.2 } as any],
    device: { animation: 'swing-in', animateIn: true, scale: 0.8 },
    category: 'creative',
  },
  {
    id: 'minimal-zen',
    name: 'Zen',
    icon: 'circle-dot',
    color: '#78716C',
    durationMs: 6000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-stone-50 to-stone-100',
    animations: [{ type: 'breathe', duration: 6000, easing: 'ease-in-out', intensity: 1.02, stagger: 0.5 } as any],
    device: { animation: 'fade', animateIn: true, scale: 0.9 },
    category: 'layout',
  },

  // --- APPLE / SHOWCASE ---
  {
    id: 'keynote-black',
    name: 'Keynote',
    icon: 'presentation',
    color: '#000',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'bg-black',
    animations: [{ type: 'hero-float', duration: 3000, easing: 'ease-out', intensity: 20, stagger: 0.1 }],
    device: { animation: 'rise', animateIn: true, scale: 0.85 },
    category: 'text',
  },
  {
    id: 'product-hero-x',
    name: 'Product X',
    icon: 'smartphone',
    color: '#333',
    durationMs: 4000,
    rotationX: 5,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-gray-900 to-black',
    animations: [{ type: 'zoom-in', duration: 1000, easing: 'ease-out', intensity: 1.2, stagger: 0 }],
    device: { animation: 'drop', animateIn: true, scale: 0.9 },
    category: 'mockup',
  },
  {
    id: 'cupertino-stage',
    name: 'Stage',
    icon: 'mic-2',
    color: '#555',
    durationMs: 5000,
    rotationX: 2,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-gray-800 to-gray-900',
    animations: [{ type: 'spotlight', duration: 5000, easing: 'ease-out', intensity: 1, stagger: 0 } as any],
    device: { animation: 'fade', animateIn: true, scale: 0.8 },
    category: 'mockup',
  },
  {
    id: 'event-reveal',
    name: 'Event',
    icon: 'calendar-star',
    color: '#D946EF',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-fuchsia-100 to-pink-100',
    animations: [{ type: 'confetti', duration: 3000, easing: 'ease-out', intensity: 1, stagger: 0.1 } as any],
    device: { animation: 'bounce-in', animateIn: true, scale: 0.85 },
    category: 'creative',
  },

  // --- VINTAGE / RETRO ---
  {
    id: 'retro-sunset',
    name: 'Sunset',
    icon: 'sunset',
    color: '#F97316',
    durationMs: 4000,
    rotationX: 5,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-orange-400 via-red-500 to-purple-600',
    animations: [{ type: 'scanline', duration: 4000, easing: 'linear', intensity: 10, stagger: 0.1 } as any],
    device: { animation: 'rise', animateIn: true, scale: 0.8 },
    category: 'creative',
  },
  {
    id: 'vintage-cream',
    name: 'Cream',
    icon: 'coffee',
    color: '#FDE68A',
    durationMs: 5000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 2,
    backgroundGradient: 'from-yellow-50 to-amber-50',
    animations: [{ type: 'grain', duration: 5000, easing: 'linear', intensity: 5, stagger: 0 } as any],
    device: { animation: 'fade', animateIn: true, scale: 0.9 },
    category: 'layout',
  },
  {
    id: 'polaroid-stack',
    name: 'Polaroid',
    icon: 'image',
    color: '#FFF',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 5,
    backgroundGradient: 'from-gray-100 to-white',
    animations: [{ type: 'stack-drop', duration: 2000, easing: 'active', intensity: 30, stagger: 0.2 } as any],
    device: { animation: 'drop', animateIn: true, scale: 0.8 },
    category: 'mockup',
  },
  
  // --- BOLD / EDITORIAL ---
  {
    id: 'bold-magazine',
    name: 'Magazine',
    icon: 'book-open',
    color: '#000',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-white to-gray-50',
    text: { enabled: true, headline: 'BOLD', tagline: 'Statement.', animation: 'tracking-in-expand', position: 'center' },
    animations: [{ type: 'slide-up', duration: 1500, easing: 'ease-out', intensity: 20, stagger: 0.1 }],
    device: { animation: 'zoom-in', animateIn: true, scale: 0.8 },
    category: 'text',
  },
  {
    id: 'typography-focus',
    name: 'Type',
    icon: 'pilcrow',
    color: '#333',
    durationMs: 3500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'bg-white',
    text: { enabled: true, headline: 'Aa', tagline: 'Typography matters.', animation: 'blur-in-expand', position: 'center-left' },
    animations: [{ type: 'fade', duration: 1000, easing: 'ease-out', intensity: 1, stagger: 0 }],
    device: { animation: 'slide-left', animateIn: true, scale: 0.8 },
    category: 'text',
  },
  {
    id: 'fashion-edit',
    name: 'Fashion',
    icon: 'shirt',
    color: '#EC4899',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 5,
    rotationZ: 0,
    backgroundGradient: 'from-pink-50 to-rose-50',
    text: { enabled: true, headline: 'STYLE', tagline: 'Summer Collection', animation: 'hero-reveal', position: 'bottom-center' },
    animations: [{ type: 'hover', duration: 4000, easing: 'ease-in-out', intensity: 10, stagger: 0.1 } as any],
    device: { animation: 'fade', animateIn: true, scale: 0.9 },
    category: 'text',
  }
  ,
  // --- CINEMATIC ---
  {
    id: 'hollywood-premiere',
    name: 'Premiere',
    icon: 'clapperboard',
    color: '#E11D48',
    durationMs: 5000,
    rotationX: 10,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-rose-900 to-black',
    animations: [{ type: 'spotlight', duration: 5000, easing: 'ease-out', intensity: 1, stagger: 0 } as any],
    device: { animation: 'zoom-in', animateIn: true, scale: 0.9 },
    category: 'creative',
  },
  {
    id: 'noir-detective',
    name: 'Noir',
    icon: 'search',
    color: '#52525B',
    durationMs: 6000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-gray-800 to-black',
    animations: [{ type: 'search-light', duration: 6000, easing: 'linear', intensity: 1, stagger: 0 } as any],
    device: { animation: 'fade', animateIn: true, scale: 0.9 },
    category: 'creative',
  },
  {
    id: 'sci-fi-scanner',
    name: 'Scanner',
    icon: 'scan',
    color: '#06B6D4',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-cyan-900 to-black',
    animations: [{ type: 'scan-vertical', duration: 3000, easing: 'linear', intensity: 1, stagger: 0 } as any],
    device: { animation: 'glitch', animateIn: true, scale: 0.85 } as any,
    category: 'creative',
  },

  // --- SPORTS / ENERGY ---
  {
    id: 'energy-rush',
    name: 'Energy',
    icon: 'activity',
    color: '#EAB308',
    durationMs: 2000,
    rotationX: 10,
    rotationY: -10,
    rotationZ: 5,
    backgroundGradient: 'from-yellow-400 to-orange-600',
    animations: [{ type: 'shake', duration: 500, easing: 'active', intensity: 20, stagger: 0.05 }],
    device: { animation: 'bounce-in', animateIn: true, scale: 0.9 },
    category: 'creative',
  },
  {
    id: 'speed-demon',
    name: 'Speed',
    icon: 'gauge',
    color: '#DC2626',
    durationMs: 1500,
    rotationX: 0,
    rotationY: 20,
    rotationZ: 0,
    backgroundGradient: 'from-red-600 to-red-900',
    animations: [{ type: 'slide-right', duration: 800, easing: 'active', intensity: 100, stagger: 0.05 }],
    device: { animation: 'slide-right', animateIn: true, scale: 0.9 },
    category: 'layout',
  },
  {
    id: 'active-life',
    name: 'Active',
    icon: 'heart-pulse',
    color: '#22C55E',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-green-400 to-emerald-600',
    animations: [{ type: 'pulse', duration: 1000, easing: 'ease-in-out', intensity: 1.1, stagger: 0.1 }],
    device: { animation: 'bounce-in', animateIn: true, scale: 0.85 },
    category: 'layout',
  },

  // --- FOOD / FRESH ---
  {
    id: 'fresh-organic',
    name: 'Organic',
    icon: 'leaf',
    color: '#84CC16',
    durationMs: 5000,
    rotationX: 5,
    rotationY: 5,
    rotationZ: 0,
    backgroundGradient: 'from-lime-50 to-green-100',
    animations: [{ type: 'float', duration: 3000, easing: 'ease-in-out', intensity: 5, stagger: 0.2 }],
    device: { animation: 'rise', animateIn: true, scale: 0.9 },
    category: 'creative',
  },
  {
    id: 'spicy-heat',
    name: 'Spicy',
    icon: 'flame',
    color: '#EF4444',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-red-100 to-orange-100',
    animations: [{ type: 'wobble-3d', duration: 2000, easing: 'ease-in-out', intensity: 5, stagger: 0.1 }],
    device: { animation: 'shake', animateIn: true, scale: 0.85 } as any,
    category: 'creative',
  },
  {
    id: 'sweet-treat',
    name: 'Sweet',
    icon: 'candy',
    color: '#F472B6',
    durationMs: 4000,
    rotationX: 10,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-pink-100 to-rose-200',
    animations: [{ type: 'bounce', duration: 1000, easing: 'active', intensity: 1.2, stagger: 0.1 }],
    device: { animation: 'bounce-in', animateIn: true, scale: 0.9 },
    category: 'creative',
  },
  
  // --- HOLIDAY / SEASONAL ---
  {
    id: 'winter-wonder',
    name: 'Winter',
    icon: 'snowflake',
    color: '#E0F2FE',
    durationMs: 5000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-sky-100 to-blue-50',
    animations: [{ type: 'snow-fall', duration: 5000, easing: 'linear', intensity: 1, stagger: 0.2 } as any],
    device: { animation: 'fade', animateIn: true, scale: 0.9 },
    category: 'creative',
  },
  {
    id: 'summer-vibes',
    name: 'Summer',
    icon: 'sun-medium',
    color: '#FDBA74',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-orange-200 to-yellow-200',
    animations: [{ type: 'heat-wave', duration: 4000, easing: 'ease-in-out', intensity: 5, stagger: 0.1 } as any],
    device: { animation: 'rise', animateIn: true, scale: 0.9 },
    category: 'creative',
  },
  {
    id: 'autumn-drift',
    name: 'Autumn',
    icon: 'wind',
    color: '#F59E0B',
    durationMs: 5000,
    rotationX: 5,
    rotationY: 5,
    rotationZ: 2,
    backgroundGradient: 'from-amber-100 to-orange-100',
    animations: [{ type: 'leaf-fall', duration: 5000, easing: 'ease-in-out', intensity: 10, stagger: 0.3 } as any],
    device: { animation: 'hover', animateIn: true, scale: 0.85 } as any,
  },
  
  // --- SPLIT / CREATIVE TEXT (User Requested) ---
  {
    id: 'split-left-modern',
    name: 'Split Left',
    icon: 'layout-template',
    color: '#000',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'bg-white',
    // Text on left (30% width), Device on right
    text: { 
      enabled: true, 
      headline: 'Future', 
      tagline: 'Is Here.', 
      animation: 'slide-in-left', 
      position: 'center-left', 
      headlineFontSize: 80,
      taglineFontSize: 32,
      color: '#000'
    },
    animations: [{ type: 'slide-left', duration: 1500, easing: 'ease-out', intensity: 20, stagger: 0 }],
    device: { 
      animation: 'slide-in-right', 
      animateIn: true, 
      scale: 0.85, 
      position: 'right', // Semantic position
      offsetX: 25,       // Push to right
      offsetY: 0 
    },
    category: 'text',
  },
  {
    id: 'split-right-modern',
    name: 'Split Right',
    icon: 'layout-template',
    color: '#000',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'bg-zinc-50',
    // Text on right, Device on left
    text: { 
      enabled: true, 
      headline: 'Design', 
      tagline: 'System.', 
      animation: 'slide-in-right', 
      position: 'center-right',
      headlineFontSize: 80,
      taglineFontSize: 32,
      color: '#000'
    },
    animations: [{ type: 'slide-right', duration: 1500, easing: 'ease-out', intensity: 20, stagger: 0 }],
    device: { 
      animation: 'slide-in-left', 
      animateIn: true, 
      scale: 0.85, 
      position: 'left', // Semantic position
      offsetX: -25,     // Push to left
      offsetY: 0 
    },
    category: 'text',
  },
  {
    id: 'diagonal-hero',
    name: 'Diagonal',
    icon: 'scaling',
    color: '#333',
    durationMs: 4500,
    rotationX: 5,
    rotationY: -5,
    rotationZ: 0,
    backgroundGradient: 'from-gray-100 to-gray-200',
    // Text Top-Left, Device Bottom-Right
    text: { 
      enabled: true, 
      headline: 'HERO', 
      tagline: 'Shot', 
      animation: 'reveal-top', 
      position: 'top-left',
      headlineFontSize: 120,
      taglineFontSize: 40,
      color: '#000'
    },
    animations: [{ type: 'zoom-in', duration: 1500, easing: 'ease-out', intensity: 5, stagger: 0.1 }],
    device: { 
      animation: 'rise', 
      animateIn: true, 
      scale: 0.9, 
      position: 'bottom-right',
      offsetX: 20,
      offsetY: 20
    },
    category: 'text',
  },
  {
    id: 'magazine-bottom',
    name: 'Editorial',
    icon: 'book',
    color: '#111',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'bg-stone-100',
    // Text Bottom-Left, Device Top-Right
    text: { 
      enabled: true, 
      headline: 'Edit.', 
      tagline: 'Volume 1.', 
      animation: 'tracking-in-expand', 
      position: 'bottom-left',
      headlineFontSize: 90,
      taglineFontSize: 24,
      color: '#1c1917'
    },
    animations: [{ type: 'fade', duration: 2000, easing: 'ease-out', intensity: 1, stagger: 0 }],
    device: { 
      animation: 'slide-in-top', 
      animateIn: true, 
      scale: 0.8, 
      position: 'top-right',
      offsetX: 15,
      offsetY: -15
    },
    category: 'text',
  },
  {
    id: 'minimal-side',
    name: 'Minimal Side',
    icon: 'sidebar',
    color: '#555',
    durationMs: 5000,
    rotationX: 0,
    rotationY: 10,
    rotationZ: 0,
    backgroundGradient: 'from-white to-slate-50',
    // Minimal text sidebar style
    text: { 
      enabled: true, 
      headline: 'Pure', 
      tagline: 'Simple.', 
      animation: 'fade-in-left', 
      position: 'center-left',
      headlineFontSize: 60,
      taglineFontSize: 24,
      color: '#334155'
    },
    animations: [{ type: 'soft-drift', duration: 5000, easing: 'linear', intensity: 5, stagger: 0 }],
    device: { 
      animation: 'fade', 
      animateIn: true, 
      scale: 0.75, 
      position: 'center-right',
      offsetX: 30, // Strong offset
      offsetY: 0
    },
    category: 'text',
  }
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

  // Force GPU acceleration
  const gpu = 'translateZ(0)';

  switch (type) {
    case 'none':
      return { opacity: 1, transform: 'none' };

    case 'fade':
      return { opacity: ease, transform: 'none' };

    case 'tilt-reveal':
      return {
        opacity: ease,
        transform: `perspective(1000px) rotateX(${(1 - ease) * 45}deg) rotateY(${(1 - ease) * -45}deg) scale(${0.8 + ease * 0.2}) translateY(${(1 - ease) * 100}px) ${gpu}`,
      };

    case 'swing-in':
      return {
        opacity: ease,
        transform: `perspective(1000px) rotateY(${(1 - Math.sin(p * Math.PI)) * 30}deg) translateX(${(1 - ease) * -100}px) ${gpu}`,
      };

    case 'spiral-in':
      return {
        opacity: ease,
        transform: `scale(${0.2 + ease * 0.8}) rotate(${(1 - ease) * 720}deg) translateY(${(1 - ease) * 200}px) ${gpu}`,
      };

    case 'zoom-in':
      return {
        opacity: ease,
        transform: `scale(${0.5 + ease * 0.5}) ${gpu}`,
      };

    case 'zoom-out':
      return {
        opacity: ease,
        transform: `scale(${1.5 - ease * 0.5}) ${gpu}`,
      };

    case 'rise':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 50}%) scale(${0.9 + ease * 0.1}) ${gpu}`,
      };

    case 'drop': {
      const dropBounce = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateY(${(1 - dropBounce) * -80}%) ${gpu}`,
      };
    }

    case 'flip-up':
      return {
        opacity: p > 0.3 ? 1 : p * 3,
        transform: `perspective(1000px) rotateX(${(1 - ease) * 90}deg) ${gpu}`,
      };

    case 'rotate-in':
      return {
        opacity: ease,
        transform: `rotate(${(1 - ease) * -15}deg) scale(${0.8 + ease * 0.2}) ${gpu}`,
      };

    case 'bounce-in': {
      const bounceEase = easeOutElastic(p);
      return {
        opacity: Math.min(1, p * 2),
        transform: `scale(${bounceEase}) translateZ(0)`,
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
