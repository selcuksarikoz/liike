export type LayoutAnimation = {
  type: 'float' | 'bounce' | 'rotate' | 'zoom' | 'zoom-in' | 'zoom-out' | 'zoom-up' | 'zoom-down' | 'slide' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'pulse' | 'swing' | 'shake' | 'spiral' | 'fan' | 'domino' | 'elastic-rotate' | 'converge' | 'diverge' | 'glitch' | 'wobble-3d' | 'rotate-3d' | 'elevator' | 'skew-slide' | 'orbit' | 'reveal-3d' | 'float-complex' | 'pulse-3d' | 'parallax-drift' | 'reveal-zoom' | 'magnetic' | 'none' | 'camera-pan' | 'hero-float' | 'cinematic-zoom' | 'soft-drift' | 'elastic-enter' | 'stagger-fade' | 'perspective-twist' | 'depth-hover' | 'scatter' | 'wave' | 'breathe' | 'spotlight' | 'confetti' | 'scanline' | 'grain' | 'stack-drop' | 'hover' | 'search-light' | 'scan-vertical' | 'snow-fall' | 'heat-wave' | 'leaf-fall' | 'hver' | 'fade';
  duration: number;
  easing: string;
  intensity?: number;
  stagger?: number;
};

export type MediaPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-left' | 'center-right';

export type TextPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type TextAnimationType =
  // Directional - Slide
  | 'slide-in-left'
  | 'slide-in-right'
  | 'slide-in-top'
  | 'slide-in-bottom'
  // Directional - Reveal
  | 'reveal-left'
  | 'reveal-right'
  | 'reveal-top'
  | 'reveal-bottom'
  // Directional - Bounce
  | 'bounce-left'
  | 'bounce-right'
  | 'bounce-top'
  | 'bounce-bottom'
  // Directional - Elastic
  | 'elastic-left'
  | 'elastic-right'
  // Directional - Zoom
  | 'zoom-in-left'
  | 'zoom-in-right'
  // Directional - Fade
  | 'fade-in-left'
  | 'fade-in-right'
  // Directional - Blur Slide
  | 'blur-slide-left'
  | 'blur-slide-right'
  // Directional - Skew
  | 'skew-slide-left'
  | 'skew-slide-right'
  // Directional - Float
  | 'float-up'
  | 'float-down'
  | 'float-left'
  | 'float-right'
  // Special
  | 'typewriter'
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
  // Directional - Slide
  { id: 'slide-in-left', name: 'Slide Left', icon: '➡️', category: 'basic' },
  { id: 'slide-in-right', name: 'Slide Right', icon: '⬅️', category: 'basic' },
  { id: 'slide-in-top', name: 'Slide Top', icon: '⬇️', category: 'basic' },
  { id: 'slide-in-bottom', name: 'Slide Btm', icon: '⬆️', category: 'basic' },

  // Directional - Reveal (mask)
  { id: 'reveal-left', name: 'Reveal Left', icon: '👈', category: 'premium' },
  { id: 'reveal-right', name: 'Reveal Right', icon: '👉', category: 'premium' },
  { id: 'reveal-top', name: 'Reveal Top', icon: '👇', category: 'premium' },
  { id: 'reveal-bottom', name: 'Reveal Btm', icon: '👆', category: 'premium' },

  // Directional - Bounce
  { id: 'bounce-left', name: 'Bounce Left', icon: '🏀', category: 'basic' },
  { id: 'bounce-right', name: 'Bounce Right', icon: '🏀', category: 'basic' },
  { id: 'bounce-top', name: 'Bounce Top', icon: '🏀', category: 'basic' },
  { id: 'bounce-bottom', name: 'Bounce Btm', icon: '🏀', category: 'basic' },

  // Directional - Elastic
  { id: 'elastic-left', name: 'Elastic Left', icon: '🏹', category: 'basic' },
  { id: 'elastic-right', name: 'Elastic Right', icon: '🏹', category: 'basic' },

  // Directional - Zoom
  { id: 'zoom-in-left', name: 'Zoom Left', icon: '🔍', category: 'premium' },
  { id: 'zoom-in-right', name: 'Zoom Right', icon: '🔍', category: 'premium' },

  // Directional - Fade
  { id: 'fade-in-left', name: 'Fade Left', icon: '🌫️', category: 'basic' },
  { id: 'fade-in-right', name: 'Fade Right', icon: '🌫️', category: 'basic' },

  // Directional - Blur Slide
  { id: 'blur-slide-left', name: 'Blur Left', icon: '💨', category: 'premium' },
  { id: 'blur-slide-right', name: 'Blur Right', icon: '💨', category: 'premium' },

  // Directional - Skew
  { id: 'skew-slide-left', name: 'Skew Left', icon: '📐', category: 'premium' },
  { id: 'skew-slide-right', name: 'Skew Right', icon: '📐', category: 'premium' },

  // Directional - Float
  { id: 'float-up', name: 'Float Up', icon: '☁️', category: 'basic' },
  { id: 'float-down', name: 'Float Down', icon: '☁️', category: 'basic' },
  { id: 'float-left', name: 'Float Left', icon: '☁️', category: 'basic' },
  { id: 'float-right', name: 'Float Right', icon: '☁️', category: 'basic' },

  // Special directional
  { id: 'typewriter', name: 'Typewriter', icon: '⌨️', category: 'basic' },
];

export const generateTextKeyframes = (
  type: TextAnimationType,
  progress: number
): { opacity: number; transform: string; filter?: string; clipPath?: string } => {
  const p = Math.min(1, Math.max(0, progress));
  const ease = easeOutCubic(p);

  switch (type) {
    // --- SLIDE ---
    case 'slide-in-left':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * -100}px) translateZ(0)`,
      };
    case 'slide-in-right':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * 100}px) translateZ(0)`,
      };
    case 'slide-in-top':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * -100}px) translateZ(0)`,
      };
    case 'slide-in-bottom':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 100}px) translateZ(0)`,
      };

    // --- REVEAL (mask) ---
    case 'reveal-left':
      return {
        opacity: 1,
        transform: 'translateZ(0)',
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
      };
    case 'reveal-right':
      return {
        opacity: 1,
        transform: 'translateZ(0)',
        clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`,
      };
    case 'reveal-top':
      return {
        opacity: 1,
        transform: 'translateZ(0)',
        clipPath: `inset(0 0 ${(1 - p) * 100}% 0)`,
      };
    case 'reveal-bottom':
      return {
        opacity: 1,
        transform: 'translateZ(0)',
        clipPath: `inset(${(1 - p) * 100}% 0 0 0)`,
      };

    // --- BOUNCE ---
    case 'bounce-left': {
      const bEase = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateX(${(1 - bEase) * -100}px) translateZ(0)`,
      };
    }
    case 'bounce-right': {
      const bEase = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateX(${(1 - bEase) * 100}px) translateZ(0)`,
      };
    }
    case 'bounce-top': {
      const bEase = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateY(${(1 - bEase) * -100}px) translateZ(0)`,
      };
    }
    case 'bounce-bottom': {
      const bEase = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateY(${(1 - bEase) * 100}px) translateZ(0)`,
      };
    }

    // --- ELASTIC ---
    case 'elastic-left': {
      const elEase = easeOutElastic(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateX(${(1 - elEase) * -150}px) translateZ(0)`,
      };
    }
    case 'elastic-right': {
      const elEase = easeOutElastic(p);
      return {
        opacity: Math.min(1, p * 3),
        transform: `translateX(${(1 - elEase) * 150}px) translateZ(0)`,
      };
    }

    // --- ZOOM ---
    case 'zoom-in-left':
      return {
        opacity: ease,
        transform: `scale(${0.5 + ease * 0.5}) translateX(${(1 - ease) * -100}%) translateZ(0)`,
      };
    case 'zoom-in-right':
      return {
        opacity: ease,
        transform: `scale(${0.5 + ease * 0.5}) translateX(${(1 - ease) * 100}%) translateZ(0)`,
      };

    // --- FADE ---
    case 'fade-in-left':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * -30}px) translateZ(0)`,
      };
    case 'fade-in-right':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * 30}px) translateZ(0)`,
      };

    // --- BLUR SLIDE ---
    case 'blur-slide-left':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * -50}px) scale(${0.9 + ease * 0.1}) translateZ(0)`,
        filter: `blur(${(1 - ease) * 10}px)`,
      };
    case 'blur-slide-right':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * 50}px) scale(${0.9 + ease * 0.1}) translateZ(0)`,
        filter: `blur(${(1 - ease) * 10}px)`,
      };

    // --- SKEW ---
    case 'skew-slide-left':
      return {
        opacity: ease,
        transform: `skewX(${(1 - ease) * 20}deg) translateX(${(1 - ease) * -100}px) translateZ(0)`,
      };
    case 'skew-slide-right':
      return {
        opacity: ease,
        transform: `skewX(${(1 - ease) * -20}deg) translateX(${(1 - ease) * 100}px) translateZ(0)`,
      };

    // --- FLOAT ---
    case 'float-up':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * 30}px) translateZ(0)`,
      };
    case 'float-down':
      return {
        opacity: ease,
        transform: `translateY(${(1 - ease) * -30}px) translateZ(0)`,
      };
    case 'float-left':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * 30}px) translateZ(0)`,
      };
    case 'float-right':
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * -30}px) translateZ(0)`,
      };

    // --- SPECIAL ---
    case 'typewriter':
      return {
        opacity: 1,
        transform: 'translateZ(0)',
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
      };

    case 'none':
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
  // ==========================================
  // LAYOUT - Basic directional animations
  // ==========================================
  {
    id: 'zoom-in',
    name: 'Zoom In',
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
    id: 'zoom-out',
    name: 'Zoom Out',
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
    id: 'slide-up',
    name: 'Slide Up',
    icon: 'arrow-up',
    color: '#10B981',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-green-50 to-emerald-100',
    animations: [{ type: 'slide-up', duration: 800, easing: 'ease-out', intensity: 50, stagger: 0.15 }],
    device: { animation: 'rise', animateIn: true, scale: 0.9 },
    category: 'layout',
  },
  {
    id: 'slide-down',
    name: 'Drop In',
    icon: 'arrow-down',
    color: '#EF4444',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-red-50 to-rose-100',
    animations: [{ type: 'slide-down', duration: 800, easing: 'ease-out', intensity: 50, stagger: 0.15 }],
    device: { animation: 'drop', animateIn: true, scale: 0.9 },
    category: 'layout',
  },
  {
    id: 'slide-right',
    name: 'Slide Right',
    icon: 'arrow-right',
    color: '#F59E0B',
    durationMs: 3500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-amber-50 to-orange-50',
    animations: [{ type: 'slide-right', duration: 1000, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', intensity: 100, stagger: 0.1 }],
    device: { animation: 'swing-in', animateIn: true, scale: 0.85 },
    category: 'layout',
  },
  {
    id: 'slide-left',
    name: 'Slide Left',
    icon: 'arrow-left',
    color: '#F59E0B',
    durationMs: 3500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-orange-50 to-amber-50',
    animations: [{ type: 'slide-left', duration: 1000, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', intensity: 100, stagger: 0.1 }],
    device: { animation: 'swing-in', animateIn: true, scale: 0.85 },
    category: 'layout',
  },
  {
    id: 'float',
    name: 'Float',
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

  // ==========================================
  // CREATIVE - Dynamic, bouncy effects
  // ==========================================
  {
    id: 'bounce',
    name: 'Bounce',
    icon: 'party-popper',
    color: '#EC4899',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-pink-100 to-rose-200',
    animations: [{ type: 'bounce', duration: 1000, easing: 'ease-out', intensity: 1.5, stagger: 0.1 }],
    device: { animation: 'bounce-in', animateIn: true, scale: 0.85 },
    category: 'creative',
  },
  {
    id: 'elastic',
    name: 'Elastic',
    icon: 'spring',
    color: '#10B981',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-emerald-50 to-teal-100',
    animations: [{ type: 'elastic-enter', duration: 1500, easing: 'elastic', intensity: 100, stagger: 0.1 }],
    device: { animation: 'bounce-in', animateIn: true, scale: 0.85 },
    category: 'creative',
  },
  {
    id: 'spiral',
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
    id: 'wobble',
    name: 'Wobble',
    icon: 'cube',
    color: '#6366F1',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-gray-100 to-gray-200',
    animations: [{ type: 'shake', duration: 4000, easing: 'ease-in-out', intensity: 2, stagger: 0.2 }],
    device: { animation: 'wobble-3d', animateIn: true, scale: 0.85 },
    category: 'creative',
  },
  {
    id: 'orbit',
    name: 'Orbit',
    icon: 'planet',
    color: '#A855F7',
    durationMs: 5000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-purple-900 via-fuchsia-900 to-black',
    animations: [{ type: 'orbit', duration: 5000, easing: 'linear', intensity: 30, stagger: 0.2 }],
    device: { animation: 'reveal-zoom', animateIn: true, scale: 0.8 },
    category: 'creative',
  },
  {
    id: 'glitch',
    name: 'Glitch',
    icon: 'zap',
    color: '#EC4899',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-pink-900 via-purple-900 to-slate-900',
    animations: [{ type: 'glitch', duration: 3000, easing: 'steps(5)', intensity: 10, stagger: 0.1 }],
    device: { animation: 'wobble-3d', animateIn: true, scale: 0.85 },
    category: 'creative',
  },

  // ==========================================
  // MOCKUP - Device showcase presets
  // ==========================================
  {
    id: 'mockup-rise',
    name: 'Rise Up',
    icon: 'cube',
    color: '#10B981',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-teal-500 via-emerald-600 to-green-700',
    animations: [{ type: 'slide-up', duration: 1000, easing: 'ease-out', intensity: 40, stagger: 0.2 }],
    device: { animation: 'rise', animateIn: true, scale: 0.85 },
    category: 'mockup',
  },
  {
    id: 'mockup-reveal',
    name: 'Reveal',
    icon: 'smartphone',
    color: '#FBBF24',
    durationMs: 4500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-900 via-slate-800 to-black',
    animations: [{ type: 'zoom-out', duration: 2500, easing: 'ease-out', intensity: 1.15, stagger: 0.2 }],
    device: { animation: 'tilt-reveal', animateIn: true, scale: 0.85 },
    category: 'mockup',
  },
  {
    id: 'mockup-studio',
    name: 'Studio',
    icon: 'camera',
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
  {
    id: 'mockup-hero',
    name: 'Product Hero',
    icon: 'smartphone',
    color: '#333',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-gray-900 to-black',
    animations: [{ type: 'zoom-in', duration: 1000, easing: 'ease-out', intensity: 1.2, stagger: 0 }],
    device: { animation: 'drop', animateIn: true, scale: 0.9 },
    category: 'mockup',
  },
  {
    id: 'mockup-stage',
    name: 'Stage',
    icon: 'mic-2',
    color: '#555',
    durationMs: 5000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-gray-800 to-gray-900',
    animations: [{ type: 'spotlight', duration: 5000, easing: 'ease-out', intensity: 1, stagger: 0 }],
    device: { animation: 'fade', animateIn: true, scale: 0.85 },
    category: 'mockup',
  },

  // ==========================================
  // TEXT - Text from one side, media from opposite
  // ==========================================
  // Text LEFT -> Media RIGHT
  {
    id: 'text-left-right',
    name: 'Text Left',
    icon: 'layout-template',
    color: '#000',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'bg-white',
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
    animations: [{ type: 'fade', duration: 1500, easing: 'ease-out', intensity: 1, stagger: 0 }],
    device: {
      animation: 'swing-in',
      animateIn: true,
      scale: 0.85,
      position: 'right',
      offsetX: 25,
      offsetY: 0
    },
    category: 'text',
  },
  // Text RIGHT -> Media LEFT
  {
    id: 'text-right-left',
    name: 'Text Right',
    icon: 'layout-template',
    color: '#000',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'bg-zinc-50',
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
    animations: [{ type: 'fade', duration: 1500, easing: 'ease-out', intensity: 1, stagger: 0 }],
    device: {
      animation: 'swing-in',
      animateIn: true,
      scale: 0.85,
      position: 'left',
      offsetX: -25,
      offsetY: 0
    },
    category: 'text',
  },
  // Text TOP -> Media BOTTOM
  {
    id: 'text-top-bottom',
    name: 'Text Top',
    icon: 'layout-template',
    color: '#ffffff',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-black via-zinc-900 to-black',
    text: {
      enabled: true,
      headline: 'Showcase',
      tagline: 'Your masterpiece.',
      animation: 'slide-in-top',
      position: 'top-center',
      headlineFontSize: 72,
      taglineFontSize: 28,
      color: '#ffffff'
    },
    animations: [{ type: 'zoom-in', duration: 3000, easing: 'ease-out', intensity: 1.05, stagger: 0.1 }],
    device: {
      animation: 'rise',
      animateIn: true,
      scale: 0.75,
      position: 'bottom',
      offsetX: 0,
      offsetY: 25
    },
    category: 'text',
  },
  // Text BOTTOM -> Media TOP
  {
    id: 'text-bottom-top',
    name: 'Text Bottom',
    icon: 'layout-template',
    color: '#111',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'bg-stone-100',
    text: {
      enabled: true,
      headline: 'Edit.',
      tagline: 'Volume 1.',
      animation: 'slide-in-bottom',
      position: 'bottom-center',
      headlineFontSize: 90,
      taglineFontSize: 24,
      color: '#1c1917'
    },
    animations: [{ type: 'fade', duration: 2000, easing: 'ease-out', intensity: 1, stagger: 0 }],
    device: {
      animation: 'drop',
      animateIn: true,
      scale: 0.8,
      position: 'top',
      offsetX: 0,
      offsetY: -20
    },
    category: 'text',
  },
  // Text TOP-LEFT -> Media BOTTOM-RIGHT (diagonal)
  {
    id: 'text-diagonal-tl-br',
    name: 'Diagonal TL',
    icon: 'scaling',
    color: '#333',
    durationMs: 4500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-gray-100 to-gray-200',
    text: {
      enabled: true,
      headline: 'HERO',
      tagline: 'Shot',
      animation: 'slide-in-left',
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
  // Text TOP-RIGHT -> Media BOTTOM-LEFT (diagonal)
  {
    id: 'text-diagonal-tr-bl',
    name: 'Diagonal TR',
    icon: 'scaling',
    color: '#333',
    durationMs: 4500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-100 to-slate-200',
    text: {
      enabled: true,
      headline: 'Style',
      tagline: 'Matters',
      animation: 'slide-in-right',
      position: 'top-right',
      headlineFontSize: 100,
      taglineFontSize: 36,
      color: '#1e293b'
    },
    animations: [{ type: 'zoom-in', duration: 1500, easing: 'ease-out', intensity: 5, stagger: 0.1 }],
    device: {
      animation: 'rise',
      animateIn: true,
      scale: 0.85,
      position: 'bottom-left',
      offsetX: -20,
      offsetY: 20
    },
    category: 'text',
  },
  // Text BOTTOM-LEFT -> Media TOP-RIGHT (diagonal)
  {
    id: 'text-diagonal-bl-tr',
    name: 'Diagonal BL',
    icon: 'scaling',
    color: '#111',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-rose-50 to-pink-100',
    text: {
      enabled: true,
      headline: 'Bold',
      tagline: 'Statement.',
      animation: 'slide-in-left',
      position: 'bottom-left',
      headlineFontSize: 90,
      taglineFontSize: 28,
      color: '#1c1917'
    },
    animations: [{ type: 'fade', duration: 2000, easing: 'ease-out', intensity: 1, stagger: 0 }],
    device: {
      animation: 'drop',
      animateIn: true,
      scale: 0.8,
      position: 'top-right',
      offsetX: 15,
      offsetY: -15
    },
    category: 'text',
  },
  // Text BOTTOM-RIGHT -> Media TOP-LEFT (diagonal)
  {
    id: 'text-diagonal-br-tl',
    name: 'Diagonal BR',
    icon: 'scaling',
    color: '#EC4899',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-pink-50 to-rose-50',
    text: {
      enabled: true,
      headline: 'STYLE',
      tagline: 'Summer Collection',
      animation: 'slide-in-right',
      position: 'bottom-right',
      headlineFontSize: 80,
      taglineFontSize: 24,
      color: '#be185d'
    },
    animations: [{ type: 'fade', duration: 2000, easing: 'ease-in-out', intensity: 1, stagger: 0.1 }],
    device: {
      animation: 'drop',
      animateIn: true,
      scale: 0.85,
      position: 'top-left',
      offsetX: -15,
      offsetY: -15
    },
    category: 'text',
  },
  // Special: Elastic text animations
  {
    id: 'text-elastic-lr',
    name: 'Elastic Split',
    icon: 'spring',
    color: '#8B5CF6',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-violet-50 to-purple-100',
    text: {
      enabled: true,
      headline: 'Impact',
      tagline: 'Make it count.',
      animation: 'elastic-left',
      position: 'center-left',
      headlineFontSize: 80,
      taglineFontSize: 28,
      color: '#6d28d9'
    },
    animations: [{ type: 'elastic-enter', duration: 1500, easing: 'elastic', intensity: 50, stagger: 0.1 }],
    device: {
      animation: 'bounce-in',
      animateIn: true,
      scale: 0.8,
      position: 'right',
      offsetX: 25,
      offsetY: 0
    },
    category: 'text',
  },
  // Special: Blur reveal text
  {
    id: 'text-blur-reveal',
    name: 'Blur Reveal',
    icon: 'pilcrow',
    color: '#333',
    durationMs: 3500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'bg-white',
    text: {
      enabled: true,
      headline: 'Aa',
      tagline: 'Typography matters.',
      animation: 'blur-slide-left',
      position: 'center-left',
      headlineFontSize: 100,
      taglineFontSize: 28,
      color: '#18181b'
    },
    animations: [{ type: 'fade', duration: 1000, easing: 'ease-out', intensity: 1, stagger: 0 }],
    device: {
      animation: 'fade',
      animateIn: true,
      scale: 0.75,
      position: 'center-right',
      offsetX: 30,
      offsetY: 0
    },
    category: 'text',
  },
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
 * NOTE: Removed perspective/3D transforms - they don't export well in SVG/WebKit
 */
export const generateDeviceKeyframes = (
  type: DeviceAnimationType,
  progress: number
): { opacity: number; transform: string } => {
  const p = Math.min(1, Math.max(0, progress));
  const ease = easeOutCubic(p);
  const easeQuart = easeOutQuart(p);

  switch (type) {
    case 'none':
      return { opacity: 1, transform: 'none' };

    case 'fade':
      return { opacity: ease, transform: 'scale(1)' };

    case 'tilt-reveal':
      // Simplified: scale + slide up + subtle rotate
      return {
        opacity: ease,
        transform: `scale(${0.85 + ease * 0.15}) translateY(${(1 - ease) * 60}px) rotate(${(1 - ease) * -3}deg)`,
      };

    case 'swing-in':
      // Slide from side with slight overshoot
      const swingBack = easeOutBack(p);
      return {
        opacity: ease,
        transform: `translateX(${(1 - swingBack) * -80}px) scale(${0.9 + ease * 0.1})`,
      };

    case 'spiral-in':
      // Simplified spiral: rotate + scale + fade
      return {
        opacity: ease,
        transform: `scale(${0.3 + ease * 0.7}) rotate(${(1 - ease) * 180}deg)`,
      };

    case 'zoom-in':
      return {
        opacity: ease,
        transform: `scale(${0.6 + easeQuart * 0.4})`,
      };

    case 'zoom-out':
      return {
        opacity: ease,
        transform: `scale(${1.3 - ease * 0.3})`,
      };

    case 'rise':
      // Smooth rise from bottom with scale
      return {
        opacity: ease,
        transform: `translateY(${(1 - easeQuart) * 80}px) scale(${0.92 + ease * 0.08})`,
      };

    case 'drop': {
      // Bouncy drop from top
      const dropBounce = easeOutBounce(p);
      return {
        opacity: Math.min(1, p * 2.5),
        transform: `translateY(${(1 - dropBounce) * -100}px)`,
      };
    }

    case 'flip-up':
      // Simplified: scale Y + translate (mimics flip without perspective)
      const flipProgress = easeOutExpo(p);
      return {
        opacity: p > 0.2 ? 1 : p * 5,
        transform: `scaleY(${0.3 + flipProgress * 0.7}) translateY(${(1 - flipProgress) * 40}px)`,
      };

    case 'rotate-in':
      return {
        opacity: ease,
        transform: `rotate(${(1 - ease) * -12}deg) scale(${0.85 + ease * 0.15})`,
      };

    case 'bounce-in': {
      const bounceEase = easeOutElastic(p);
      return {
        opacity: Math.min(1, p * 2),
        transform: `scale(${0.5 + bounceEase * 0.5})`,
      };
    }

    case 'wobble-3d': {
      // Simplified wobble: alternating rotation with decay
      const wobbleAngle = Math.sin(p * Math.PI * 3) * (1 - p) * 8;
      return {
        opacity: ease,
        transform: `rotate(${wobbleAngle}deg) scale(${0.9 + ease * 0.1})`,
      };
    }

    case 'reveal-zoom':
      // Scale up from small with slide
      return {
        opacity: ease,
        transform: `scale(${0.4 + easeQuart * 0.6}) translateY(${(1 - ease) * 30}px)`,
      };

    case 'parallax-3d':
      // Simplified parallax: horizontal slide with scale
      return {
        opacity: ease,
        transform: `translateX(${(1 - ease) * -60}px) scale(${0.85 + ease * 0.15})`,
      };

    case 'magnetic':
      // Subtle magnetic pull effect
      const magneticPull = easeOutExpo(p);
      return {
        opacity: ease,
        transform: `scale(${0.95 + magneticPull * 0.05}) translateY(${(1 - magneticPull) * 15}px)`,
      };

    default:
      return { opacity: 1, transform: 'scale(1)' };
  }
};
