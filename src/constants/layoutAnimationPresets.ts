export type LayoutAnimation = {
  type: 'float' | 'bounce' | 'rotate' | 'zoom' | 'zoom-in' | 'zoom-out' | 'zoom-up' | 'zoom-down' | 'slide' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'pulse' | 'swing' | 'shake' | 'spiral' | 'fan' | 'domino' | 'elastic-rotate' | 'converge' | 'diverge' | 'glitch' | 'wobble-3d' | 'rotate-3d' | 'elevator' | 'skew-slide' | 'none';
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
  | 'bounce' | 'elastic' | 'typewriter' | 'wave' | 'glitch' | 'flip' | 'scale';

export type DeviceConfig = {
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
  // --- SINGLE IMAGE (1) ---
  {
    id: 'hero-spotlight',
    name: 'Hero Spotlight',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-950 via-slate-900 to-slate-950',
    icon: 'flare',
    color: '#FBBF24',
    animations: [
      { type: 'zoom-out', duration: 1500, easing: 'ease-out', intensity: 1.4 },
      { type: 'pulse', duration: 2000, easing: 'ease-in-out', intensity: 1.05 },
    ],
    durationMs: 3000,
  },
  {
    id: 'hero-cinema',
    name: 'Cinematic',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-black via-zinc-900 to-black',
    icon: 'movie',
    color: '#DC2626',
    animations: [{ type: 'zoom-in', duration: 4000, easing: 'ease-out', intensity: 1.15 }],
    durationMs: 4500,
  },
  {
    id: 'hero-rise',
    name: 'Grand Rise',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-amber-900 via-orange-800 to-yellow-700',
    icon: 'trending_up',
    color: '#F97316',
    animations: [{ type: 'zoom-up', duration: 1400, easing: 'ease-out', intensity: 1.2 }],
    durationMs: 3000,
  },
  {
    id: 'hero-pop',
    name: 'Hyper Pop',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-fuchsia-600 via-pink-500 to-rose-500',
    icon: 'celebration',
    color: '#EC4899',
    animations: [
      { type: 'zoom-out', duration: 600, easing: 'ease-out', intensity: 1.5 },
      { type: 'bounce', duration: 800, easing: 'ease-out', intensity: 12 },
    ],
    durationMs: 2500,
  },
  {
    id: 'hero-slide',
    name: 'Power Slide',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-blue-700 via-blue-600 to-cyan-500',
    icon: 'trending_flat',
    color: '#3B82F6',
    animations: [{ type: 'slide-right', duration: 1000, easing: 'ease-out', intensity: 120 }],
    durationMs: 2500,
  },
  {
    id: 'hero-drift',
    name: 'Studio Drift',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-indigo-900 via-purple-900 to-slate-900',
    icon: 'auto_awesome',
    color: '#818CF8',
    animations: [{ type: 'float', duration: 3000, easing: 'ease-in-out', intensity: 20 }],
    durationMs: 4000,
  },
  {
    id: 'hero-3d',
    name: '3D Studio',
    rotationX: 10,
    rotationY: -10,
    rotationZ: 0,
    backgroundGradient: 'from-slate-900 via-zinc-800 to-slate-900',
    icon: '3d_rotation',
    color: '#34d399',
    animations: [{ type: 'wobble-3d', duration: 3000, easing: 'ease-in-out', intensity: 10 }],
    durationMs: 4000,
  },
  // -- Creative & Social --
  {
    id: 'creative-hyper-pop',
    name: 'Hyper Pop',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-fuchsia-600 via-purple-600 to-indigo-600',
    icon: 'auto_awesome',
    color: '#EC4899',
    animations: [
      { type: 'zoom-out', duration: 800, easing: 'ease-out', intensity: 1.6 },
      { type: 'bounce', duration: 1000, easing: 'ease-out', intensity: 20 },
      { type: 'glitch', duration: 400, easing: 'linear', intensity: 3 },
    ],
    durationMs: 2500,
  },
  {
    id: 'creative-cosmic',
    name: 'Cosmic Drift',
    rotationX: 15,
    rotationY: 15,
    rotationZ: 5,
    backgroundGradient: 'from-slate-950 via-indigo-950 to-black',
    icon: 'flare',
    color: '#818CF8',
    animations: [
      { type: 'zoom-in', duration: 3000, easing: 'ease-out', intensity: 1.2 },
      { type: 'float', duration: 4000, easing: 'ease-in-out', intensity: 10 },
      { type: 'wobble-3d', duration: 5000, easing: 'ease-in-out', intensity: 5 },
    ],
    durationMs: 5000,
  },

  // --- DUAL IMAGE (2) ---
  {
    id: 'duo-spotlight',
    name: 'Duo Spotlight',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-950 via-slate-900 to-slate-950',
    icon: 'flare',
    color: '#FBBF24',
    animations: [
      { type: 'zoom-out', duration: 1500, easing: 'ease-out', intensity: 1.4, stagger: 300 },
      { type: 'pulse', duration: 2000, easing: 'ease-in-out', intensity: 1.05 },
    ],
    durationMs: 3500,
  },
  {
    id: 'duo-cinema',
    name: 'Duo Cinematic',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-black via-zinc-900 to-black',
    icon: 'movie',
    color: '#DC2626',
    animations: [{ type: 'zoom-in', duration: 4000, easing: 'ease-out', intensity: 1.15, stagger: 400 }],
    durationMs: 5000,
  },
  {
    id: 'duo-rise',
    name: 'Duo Rise',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-amber-900 via-orange-800 to-yellow-700',
    icon: 'trending_up',
    color: '#F97316',
    animations: [{ type: 'zoom-up', duration: 1400, easing: 'ease-out', intensity: 1.2, stagger: 250 }],
    durationMs: 3000,
  },
  {
    id: 'duo-pop',
    name: 'Duo Pop',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-fuchsia-600 via-pink-500 to-rose-500',
    icon: 'celebration',
    color: '#EC4899',
    animations: [
      { type: 'zoom-out', duration: 600, easing: 'ease-out', intensity: 1.5, stagger: 150 },
      { type: 'bounce', duration: 800, easing: 'ease-out', intensity: 12, stagger: 150 },
    ],
    durationMs: 2500,
  },
  {
    id: 'duo-slide',
    name: 'Duo Slide',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-blue-700 via-blue-600 to-cyan-500',
    icon: 'trending_flat',
    color: '#3B82F6',
    animations: [
      { type: 'slide-right', duration: 1000, easing: 'ease-out', intensity: 120, stagger: 200 }
    ],
    durationMs: 2800,
  },
  {
    id: 'duo-drift',
    name: 'Duo Drift',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-indigo-900 via-purple-900 to-slate-900',
    icon: 'auto_awesome',
    color: '#818CF8',
    animations: [{ type: 'float', duration: 3000, easing: 'ease-in-out', intensity: 20, stagger: 500 }],
    durationMs: 4500,
  },
  {
    id: 'duo-3d',
    name: 'Duo 3D Studio',
    rotationX: 10,
    rotationY: -10,
    rotationZ: 0,
    backgroundGradient: 'from-slate-900 via-zinc-800 to-slate-900',
    icon: '3d_rotation',
    color: '#34d399',
    animations: [{ type: 'wobble-3d', duration: 3000, easing: 'ease-in-out', intensity: 10, stagger: 300 }],
    durationMs: 4500,
  },
  // -- Creative & Social --
  {
    id: 'creative-duo-bounce',
    name: 'Double Bounce',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-lime-500 via-green-500 to-emerald-600',
    icon: 'sports_basketball',
    color: '#84CC16',
    animations: [
      { type: 'zoom-out', duration: 600, easing: 'ease-out', intensity: 1.5, stagger: 200 },
      { type: 'bounce', duration: 800, easing: 'ease-out', intensity: 25, stagger: 200 },
    ],
    durationMs: 3000,
  },
  {
    id: 'creative-matrix-duo',
    name: 'Cyber Duo',
    rotationX: 20,
    rotationY: 20,
    rotationZ: 0,
    backgroundGradient: 'from-gray-950 via-cyan-950 to-black',
    icon: 'terminal',
    color: '#22D3EE',
    animations: [
      { type: 'glitch', duration: 500, easing: 'linear', intensity: 4, stagger: 250 },
      { type: 'zoom-in', duration: 3000, easing: 'ease-out', intensity: 1.15, stagger: 250 },
    ],
    durationMs: 4000,
  },

  // --- TRIO IMAGE (3) ---
  {
    id: 'trio-spotlight',
    name: 'Trio Spotlight',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-950 via-slate-900 to-slate-950',
    icon: 'flare',
    color: '#FBBF24',
    animations: [
      { type: 'zoom-out', duration: 1500, easing: 'ease-out', intensity: 1.4, stagger: 250 },
      { type: 'pulse', duration: 2000, easing: 'ease-in-out', intensity: 1.05 },
    ],
    durationMs: 4000,
  },
  {
    id: 'trio-cinema',
    name: 'Trio Cinematic',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-black via-zinc-900 to-black',
    icon: 'movie',
    color: '#DC2626',
    animations: [{ type: 'zoom-in', duration: 4500, easing: 'ease-out', intensity: 1.15, stagger: 350 }],
    durationMs: 5500,
  },
  {
    id: 'trio-rise',
    name: 'Trio Rise',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-amber-900 via-orange-800 to-yellow-700',
    icon: 'trending_up',
    color: '#F97316',
    animations: [{ type: 'zoom-up', duration: 1400, easing: 'ease-out', intensity: 1.2, stagger: 200 }],
    durationMs: 3500,
  },
  {
    id: 'trio-pop',
    name: 'Trio Pop',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-fuchsia-600 via-pink-500 to-rose-500',
    icon: 'celebration',
    color: '#EC4899',
    animations: [
      { type: 'zoom-out', duration: 600, easing: 'ease-out', intensity: 1.5, stagger: 120 },
      { type: 'bounce', duration: 800, easing: 'ease-out', intensity: 12, stagger: 120 },
    ],
    durationMs: 3000,
  },
  {
    id: 'trio-slide',
    name: 'Trio Slide',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-blue-700 via-blue-600 to-cyan-500',
    icon: 'trending_flat',
    color: '#3B82F6',
    animations: [
      { type: 'slide-right', duration: 1000, easing: 'ease-out', intensity: 120, stagger: 180 }
    ],
    durationMs: 3200,
  },
  {
    id: 'trio-drift',
    name: 'Trio Drift',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-indigo-900 via-purple-900 to-slate-900',
    icon: 'auto_awesome',
    color: '#818CF8',
    animations: [{ type: 'float', duration: 3000, easing: 'ease-in-out', intensity: 20, stagger: 400 }],
    durationMs: 5000,
  },
  {
    id: 'trio-3d',
    name: 'Trio 3D Studio',
    rotationX: 10,
    rotationY: -10,
    rotationZ: 0,
    backgroundGradient: 'from-slate-900 via-zinc-800 to-slate-900',
    icon: '3d_rotation',
    color: '#34d399',
    animations: [{ type: 'wobble-3d', duration: 3000, easing: 'ease-in-out', intensity: 10, stagger: 250 }],
    durationMs: 5000,
  },
  // -- Creative & Social --
  {
    id: 'creative-trio-matrix',
    name: 'Matrix Echo',
    rotationX: 20,
    rotationY: 20,
    rotationZ: 0,
    backgroundGradient: 'from-black via-emerald-950 to-black',
    icon: 'grid_view',
    color: '#10B981',
    animations: [
      { type: 'glitch', duration: 400, easing: 'linear', intensity: 5, stagger: 150 },
      { type: 'zoom-out', duration: 1500, easing: 'ease-out', intensity: 1.4, stagger: 150 },
      { type: 'pulse', duration: 2000, easing: 'ease-in-out', intensity: 1.05 },
    ],
    durationMs: 4000,
  },
  {
    id: 'creative-fan-spiral',
    name: 'Spiral Fan',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-amber-400 via-orange-500 to-rose-500',
    icon: 'cyclone',
    color: '#F97316',
    animations: [
      { type: 'spiral', duration: 1200, easing: 'ease-out', intensity: 720, stagger: 200 },
      { type: 'bounce', duration: 800, easing: 'ease-out', intensity: 15, stagger: 200 },
    ],
    durationMs: 3500,
  },


  // =============================================================================
  // TEXT ANIMATION PRESETS
  // =============================================================================
  // Apple-Style Hero Intros
  {
    id: 'text-apple-intro',
    name: 'Apple Intro',
    icon: '',
    color: '#ffffff',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-black via-zinc-900 to-black',
    animations: [{ type: 'zoom-in', duration: 2000, easing: 'ease-out', intensity: 1.1 }],
    category: 'text',
    device: { position: 'bottom', scale: 0.75, offsetX: 0, offsetY: 20, animation: 'rise', animateIn: true },
    text: { enabled: true, headline: 'iPhone 16 Pro', tagline: 'Built for Apple Intelligence.', animation: 'blur', position: 'top-center', headlineFontSize: 64, taglineFontSize: 24, fontFamily: 'Manrope', color: '#ffffff' },
  },
  {
    id: 'text-keynote',
    name: 'Keynote',
    icon: '🎤',
    color: '#ffffff',
    durationMs: 4500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-black via-zinc-900 to-black',
    animations: [{ type: 'zoom-in', duration: 2500, easing: 'ease-out', intensity: 1.15 }],
    category: 'text',
    device: { position: 'bottom', scale: 0.7, offsetX: 0, offsetY: 25, animation: 'rise', animateIn: true },
    text: { enabled: true, headline: 'This is iPhone', tagline: 'The best iPhone ever made.', animation: 'zoom-blur', position: 'top-center', headlineFontSize: 72, taglineFontSize: 28, fontFamily: 'Manrope', color: '#ffffff' },
  },
  {
    id: 'text-pro-reveal',
    name: 'Pro Reveal',
    icon: '⚡',
    color: '#ffffff',
    durationMs: 3500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-950 via-slate-900 to-black',
    animations: [{ type: 'zoom-out', duration: 1500, easing: 'ease-out', intensity: 1.3 }],
    category: 'text',
    device: { position: 'bottom', scale: 0.75, offsetX: 0, offsetY: 20, animation: 'bounce-in', animateIn: true },
    text: { enabled: true, headline: 'Pro', tagline: 'Beyond professional.', animation: 'elastic', position: 'top-center', headlineFontSize: 96, taglineFontSize: 24, fontFamily: 'Manrope', color: '#ffffff' },
  },
  // App Store Style
  {
    id: 'text-app-feature',
    name: 'App Feature',
    icon: '📱',
    color: '#ffffff',
    durationMs: 3500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-violet-600 via-purple-600 to-indigo-600',
    animations: [{ type: 'bounce', duration: 800, easing: 'ease-out', intensity: 15 }],
    category: 'text',
    device: { position: 'bottom', scale: 0.8, offsetX: 0, offsetY: 15, animation: 'bounce-in', animateIn: true },
    text: { enabled: true, headline: 'App of the Day', tagline: 'Discover something new.', animation: 'bounce', position: 'top-center', headlineFontSize: 48, taglineFontSize: 20, fontFamily: 'Manrope', color: '#ffffff' },
  },
  {
    id: 'text-launch-day',
    name: 'Launch Day',
    icon: '🚀',
    color: '#ffffff',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-emerald-500 via-green-500 to-teal-500',
    animations: [{ type: 'slide-up', duration: 800, easing: 'ease-out', intensity: 80 }],
    category: 'text',
    device: { position: 'bottom', scale: 0.75, offsetX: 0, offsetY: 20, animation: 'rise', animateIn: true },
    text: { enabled: true, headline: 'Available Now', tagline: 'Download on the App Store.', animation: 'elastic', position: 'top-center', headlineFontSize: 60, taglineFontSize: 22, fontFamily: 'Manrope', color: '#ffffff' },
  },
  // Dramatic Reveals
  {
    id: 'text-one-more-thing',
    name: 'One More Thing',
    icon: '✨',
    color: '#ffffff',
    durationMs: 5000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-black via-zinc-900 to-black',
    animations: [{ type: 'zoom-in', duration: 3000, easing: 'ease-out', intensity: 1.2 }],
    category: 'text',
    device: { position: 'bottom', scale: 0.65, offsetX: 0, offsetY: 30, animation: 'fade', animateIn: true },
    text: { enabled: true, headline: 'One more thing...', tagline: '', animation: 'typewriter', position: 'top-center', headlineFontSize: 56, taglineFontSize: 0, fontFamily: 'Manrope', color: '#ffffff' },
  },
  // Split Layouts
  {
    id: 'text-split-left',
    name: 'Split Left',
    icon: '◀️',
    color: '#ffffff',
    durationMs: 3500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-blue-700 via-blue-600 to-cyan-500',
    animations: [{ type: 'slide-right', duration: 900, easing: 'ease-out', intensity: 120 }],
    category: 'text',
    device: { position: 'right', scale: 0.8, offsetX: 25, offsetY: 0, animation: 'slide-left', animateIn: true },
    text: { enabled: true, headline: 'Beautiful Design', tagline: 'Crafted with care.', animation: 'slide-up', position: 'center-left', headlineFontSize: 48, taglineFontSize: 20, fontFamily: 'Manrope', color: '#ffffff' },
  },
  {
    id: 'text-split-right',
    name: 'Split Right',
    icon: '▶️',
    color: '#ffffff',
    durationMs: 3500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-rose-700 via-red-600 to-orange-500',
    animations: [{ type: 'slide-left', duration: 900, easing: 'ease-out', intensity: 120 }],
    category: 'text',
    device: { position: 'left', scale: 0.8, offsetX: -25, offsetY: 0, animation: 'slide-right', animateIn: true },
    text: { enabled: true, headline: 'Pro Features', tagline: 'Unlocked for you.', animation: 'slide-down', position: 'center-right', headlineFontSize: 48, taglineFontSize: 20, fontFamily: 'Manrope', color: '#ffffff' },
  },

  // =============================================================================
  // MOCKUP GENERATOR PRESETS
  // =============================================================================
  {
    id: 'mockup-dribbble-dark',
    name: 'Dribbble Dark',
    icon: '🎨',
    color: '#EA4C89',
    durationMs: 4000,
    rotationX: 15,
    rotationY: -20,
    rotationZ: 5,
    backgroundGradient: 'from-zinc-900 via-zinc-950 to-black',
    animations: [
      { type: 'wobble-3d', duration: 4000, easing: 'ease-in-out', intensity: 8 },
      { type: 'float', duration: 3000, easing: 'ease-in-out', intensity: 10 }
    ],
    category: 'mockup',
    device: { position: 'center', scale: 0.85, offsetX: 0, offsetY: 0, animation: 'none', animateIn: false },
  },
  {
    id: 'mockup-apple-glass',
    name: 'Apple Glass',
    icon: '👓',
    color: '#007AFF',
    durationMs: 5000,
    rotationX: 10,
    rotationY: 10,
    rotationZ: 0,
    backgroundGradient: 'from-blue-500 via-indigo-500 to-purple-600',
    animations: [
      { type: 'rotate', duration: 10000, easing: 'linear', intensity: 360 },
      { type: 'float', duration: 4000, easing: 'ease-in-out', intensity: 15 }
    ],
    category: 'mockup',
    device: { position: 'center', scale: 0.8, offsetX: 0, offsetY: 0, animation: 'rise', animateIn: true },
  },
  {
    id: 'mockup-startup-hero',
    name: 'Startup Hero',
    icon: '🚀',
    color: '#6366F1',
    durationMs: 3500,
    rotationX: 25,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-indigo-600 via-violet-600 to-purple-600',
    animations: [
      { type: 'zoom-out', duration: 1500, easing: 'ease-out', intensity: 1.2 },
      { type: 'float', duration: 2500, easing: 'ease-in-out', intensity: 12 }
    ],
    category: 'mockup',
    device: { position: 'center', scale: 0.9, offsetX: 0, offsetY: 10, animation: 'none', animateIn: false },
  },
  {
    id: 'mockup-minimal-shadow',
    name: 'Minimal Clean',
    icon: '✨',
    color: '#F4F4F5',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-50 via-slate-100 to-slate-200',
    animations: [
      { type: 'zoom-in', duration: 3000, easing: 'ease-out', intensity: 1.05 }
    ],
    category: 'mockup',
    device: { position: 'center', scale: 0.8, offsetX: 0, offsetY: 0, animation: 'none', animateIn: false },
  },
  {
    id: 'mockup-isometric-right',
    name: 'Isometric Right',
    icon: '📐',
    color: '#10B981',
    durationMs: 4500,
    rotationX: 35,
    rotationY: 45,
    rotationZ: -10,
    backgroundGradient: 'from-teal-500 via-emerald-500 to-green-500',
    animations: [
      { type: 'float', duration: 3500, easing: 'ease-in-out', intensity: 20 },
      { type: 'wobble-3d', duration: 5000, easing: 'ease-in-out', intensity: 5 }
    ],
    category: 'mockup',
    device: { position: 'center', scale: 0.75, offsetX: 10, offsetY: 5, animation: 'none', animateIn: false },
  },
  {
    id: 'mockup-floating-parallax',
    name: 'Parallax Float',
    icon: '☁️',
    color: '#38BDF8',
    durationMs: 6000,
    rotationX: -10,
    rotationY: 15,
    rotationZ: 5,
    backgroundGradient: 'from-sky-400 via-blue-500 to-indigo-600',
    animations: [
      { type: 'float', duration: 3000, easing: 'ease-in-out', intensity: 25 },
      { type: 'rotate', duration: 12000, easing: 'linear', intensity: 360 }
    ],
    category: 'mockup',
    device: { position: 'center', scale: 0.85, offsetX: 0, offsetY: 0, animation: 'fade', animateIn: true },
  },
  {
    id: 'mockup-angled-display',
    name: 'Angled Studio',
    icon: '📷',
    color: '#64748B',
    durationMs: 4000,
    rotationX: 5,
    rotationY: 35,
    rotationZ: 0,
    backgroundGradient: 'from-gray-100 via-gray-200 to-gray-300',
    animations: [
      { type: 'zoom-out', duration: 2000, easing: 'ease-out', intensity: 1.15 }
    ],
    category: 'mockup',
    device: { position: 'right', scale: 0.9, offsetX: 15, offsetY: 0, animation: 'none', animateIn: false },
  },
  {
    id: 'mockup-dual-depth',
    name: 'Dual Depth',
    icon: '📑',
    color: '#F97316',
    durationMs: 5000,
    rotationX: 20,
    rotationY: -25,
    rotationZ: 10,
    backgroundGradient: 'from-orange-500 via-red-500 to-rose-600',
    animations: [
      { type: 'wobble-3d', duration: 4500, easing: 'ease-in-out', intensity: 12 },
      { type: 'float', duration: 3500, easing: 'ease-in-out', intensity: 15 }
    ],
    category: 'mockup',
    device: { position: 'center', scale: 0.8, offsetX: -10, offsetY: 0, animation: 'bounce-in', animateIn: true },
  },
  {
    id: 'mockup-isometric-floating',
    name: 'Perspective Floating',
    icon: '🚀',
    color: '#818cf8',
    durationMs: 5000,
    rotationX: 45,
    rotationY: -35,
    rotationZ: 15,
    backgroundGradient: 'from-blue-600 via-indigo-600 to-purple-700',
    animations: [
      { type: 'float', duration: 3000, easing: 'ease-in-out', intensity: 20 },
      { type: 'wobble-3d', duration: 6000, easing: 'ease-in-out', intensity: 10 }
    ],
    category: 'mockup',
    device: { position: 'center', scale: 0.7, offsetX: 0, offsetY: 0, animation: 'rise', animateIn: true },
  },
  {
    id: 'mockup-studio-front',
    name: 'Clean Studio',
    icon: '🏢',
    color: '#64748b',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-100 via-slate-200 to-slate-300',
    animations: [
      { type: 'zoom-out', duration: 1500, easing: 'ease-out', intensity: 1.1 }
    ],
    category: 'mockup',
    device: { position: 'center', scale: 0.85, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'mockup-social-grid',
    name: 'Social Grid',
    icon: '📱',
    color: '#f43f5e',
    durationMs: 4000,
    rotationX: 10,
    rotationY: -10,
    rotationZ: 0,
    backgroundGradient: 'from-rose-500 via-pink-500 to-orange-500',
    animations: [
      { type: 'bounce', duration: 1200, easing: 'ease-out', intensity: 15 }
    ],
    category: 'mockup',
    device: { position: 'center', scale: 0.8, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'mockup-cinema-reveal',
    name: 'Cinema Reveal',
    icon: '🎬',
    color: '#000000',
    durationMs: 3500,
    rotationX: 5,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-zinc-900 via-black to-zinc-900',
    animations: [
      { type: 'zoom-in', duration: 3000, easing: 'ease-out', intensity: 1.2 },
      { type: 'float', duration: 4000, easing: 'ease-in-out', intensity: 5 }
    ],
    category: 'mockup',
    device: { position: 'bottom', scale: 0.9, offsetX: 0, offsetY: 20, animation: 'fade' },
  },
  // Minimal & Clean
  {
    id: 'text-minimal',
    name: 'Minimal',
    icon: '🎯',
    color: '#ffffff',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-900 via-zinc-800 to-slate-900',
    animations: [{ type: 'zoom-up', duration: 1000, easing: 'ease-out', intensity: 1.1 }],
    category: 'text',
    device: { position: 'bottom', scale: 0.8, offsetX: 0, offsetY: 15, animation: 'fade', animateIn: true },
    text: { enabled: true, headline: 'Think', tagline: 'Different.', animation: 'fade', position: 'top-center', headlineFontSize: 80, taglineFontSize: 32, fontFamily: 'Manrope', color: '#ffffff' },
  },
  {
    id: 'text-hello-again',
    name: 'Hello Again',
    icon: '👋',
    color: '#ffffff',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-sky-400 via-indigo-400 to-purple-500',
    animations: [{ type: 'float', duration: 3000, easing: 'ease-in-out', intensity: 15 }],
    category: 'text',
    device: { position: 'bottom', scale: 0.7, offsetX: 0, offsetY: 25, animation: 'rise', animateIn: true },
    text: { enabled: true, headline: 'Hello', tagline: "It's nice to meet you.", animation: 'wave', position: 'top-center', headlineFontSize: 72, taglineFontSize: 24, fontFamily: 'Manrope', color: '#ffffff' },
  },
  // Cinematic
  {
    id: 'text-cinema-rise',
    name: 'Cinema Rise',
    icon: '🎬',
    color: '#ffffff',
    durationMs: 4500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-black via-zinc-900 to-black',
    animations: [{ type: 'zoom-in', duration: 3000, easing: 'ease-out', intensity: 1.1 }],
    category: 'text',
    device: { position: 'top', scale: 0.75, offsetX: 0, offsetY: -20, animation: 'drop', animateIn: true },
    text: { enabled: true, headline: 'Coming Soon', tagline: 'A new era begins.', animation: 'slide-up', position: 'bottom-center', headlineFontSize: 56, taglineFontSize: 22, fontFamily: 'Manrope', color: '#ffffff' },
  },
  // Playful
  {
    id: 'text-bounce-pop',
    name: 'Bounce Pop',
    icon: '💥',
    color: '#ffffff',
    durationMs: 2500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-fuchsia-600 via-pink-500 to-rose-500',
    animations: [{ type: 'zoom-out', duration: 600, easing: 'ease-out', intensity: 1.5 }],
    category: 'text',
    device: { position: 'bottom', scale: 0.8, offsetX: 0, offsetY: 15, animation: 'bounce-in', animateIn: true },
    text: { enabled: true, headline: 'POW!', tagline: 'That just happened.', animation: 'bounce', position: 'top-center', headlineFontSize: 96, taglineFontSize: 24, fontFamily: 'Manrope', color: '#ffffff' },
  },
  // Tech / Futuristic
  {
    id: 'text-glitch-fx',
    name: 'Glitch FX',
    icon: '🖥️',
    color: '#22d3ee',
    durationMs: 3500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-gray-900 via-gray-800 to-black',
    animations: [{ type: 'glitch', duration: 400, easing: 'linear', intensity: 5 }],
    category: 'text',
    device: { position: 'center', scale: 0.9, offsetX: 0, offsetY: 0, animation: 'zoom-in', animateIn: true },
    text: { enabled: true, headline: 'SYSTEM_READY', tagline: '> Initializing...', animation: 'glitch', position: 'center', headlineFontSize: 64, taglineFontSize: 20, fontFamily: 'Manrope', color: '#22d3ee' },
  },
  {
    id: 'text-ai-powered',
    name: 'AI Powered',
    icon: '🤖',
    color: '#ffffff',
    durationMs: 4000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-violet-700 via-purple-600 to-indigo-600',
    animations: [{ type: 'zoom-in', duration: 2000, easing: 'ease-out', intensity: 1.15 }],
    category: 'text',
    device: { position: 'bottom', scale: 0.75, offsetX: 0, offsetY: 20, animation: 'rise', animateIn: true },
    text: { enabled: true, headline: 'AI Inside', tagline: 'Intelligent by design.', animation: 'zoom-blur', position: 'top-center', headlineFontSize: 60, taglineFontSize: 22, fontFamily: 'Manrope', color: '#ffffff' },
  },
  // Professional
  {
    id: 'text-saas-hero',
    name: 'SaaS Hero',
    icon: '🚀',
    color: '#ffffff',
    durationMs: 3500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-blue-700 via-blue-600 to-cyan-500',
    animations: [{ type: 'slide-right', duration: 900, easing: 'ease-out', intensity: 100 }],
    category: 'text',
    device: { position: 'right', scale: 0.8, offsetX: 25, offsetY: 0, animation: 'slide-left', animateIn: true },
    text: { enabled: true, headline: '10x Faster', tagline: 'Your workflow, supercharged.', animation: 'slide-up', position: 'center-left', headlineFontSize: 56, taglineFontSize: 20, fontFamily: 'Manrope', color: '#ffffff' },
  },
  // Social Media
  {
    id: 'text-story-style',
    name: 'Story Style',
    icon: '📱',
    color: '#ffffff',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-pink-600 via-rose-500 to-red-500',
    animations: [{ type: 'bounce', duration: 700, easing: 'ease-out', intensity: 20 }],
    category: 'text',
    device: { position: 'top', scale: 0.75, offsetX: 0, offsetY: -20, animation: 'drop', animateIn: true },
    text: { enabled: true, headline: 'Swipe Up', tagline: 'Get yours now →', animation: 'elastic', position: 'bottom-center', headlineFontSize: 52, taglineFontSize: 20, fontFamily: 'Manrope', color: '#ffffff' },
  },
  // Countdown / Urgency
  {
    id: 'text-flash-sale',
    name: 'Flash Sale',
    icon: '🏷️',
    color: '#ffffff',
    durationMs: 2500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-red-600 via-orange-600 to-yellow-500',
    animations: [{ type: 'shake', duration: 600, easing: 'ease-in-out', intensity: 10 }],
    category: 'text',
    device: { position: 'bottom', scale: 0.75, offsetX: 0, offsetY: 20, animation: 'bounce-in', animateIn: true },
    text: { enabled: true, headline: '50% OFF', tagline: 'Today only!', animation: 'bounce', position: 'top-center', headlineFontSize: 88, taglineFontSize: 28, fontFamily: 'Manrope', color: '#ffffff' },
  },
];
