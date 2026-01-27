export type LayoutAnimation = {
  type: 'float' | 'bounce' | 'rotate' | 'zoom' | 'zoom-in' | 'zoom-out' | 'zoom-up' | 'zoom-down' | 'slide' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'pulse' | 'swing' | 'shake' | 'spiral' | 'fan' | 'domino' | 'elastic-rotate' | 'converge' | 'diverge' | 'glitch' | 'wobble-3d' | 'rotate-3d' | 'elevator' | 'skew-slide' | 'orbit' | 'reveal-3d' | 'float-complex' | 'pulse-3d' | 'parallax-drift' | 'reveal-zoom' | 'magnetic' | 'none';
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
  | 'none' | 'fade' | 'blur' | 'zoom-blur' | 'slide-up' | 'slide-down'
  | 'bounce' | 'elastic' | 'typewriter' | 'wave' | 'glitch' | 'flip' | 'scale'
  | 'shimmer' | 'glitch-rgb' | 'reveal-split' | 'mask-reveal' | 'perspective-3d'
  | 'blur-reveal' | 'expand-letter' | 'strobe' | 'float-drift';

export type DeviceConfig = {
  type: string;
  position: MediaPosition;
  scale: number;
  offsetX: number; // percentage
  offsetY: number; // percentage
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
];
