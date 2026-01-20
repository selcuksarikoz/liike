export type StylePreset = {
  id: string;
  label: string;
  css: {
    background?: string;
    backdropFilter?: string;
    border?: string;
    boxShadow?: string;
    opacity?: number;
  };
  preview?: string;
};

export type BorderType = {
  id: 'sharp' | 'curved' | 'round';
  label: string;
  radius: number;
};

export type ShadowType = {
  id: 'none' | 'spread' | 'hug' | 'adaptive';
  label: string;
  preview?: string;
};

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'default',
    label: 'Default',
    css: {},
  },
  {
    id: 'glass-light',
    label: 'Glass',
    css: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
    },
  },
  {
    id: 'glass-dark',
    label: 'Smoke',
    css: {
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  },
  {
    id: 'neon-glow',
    label: 'Neon',
    css: {
      background: 'rgba(0, 0, 0, 0.8)',
      border: '2px solid #00ff88',
      boxShadow: '0 0 20px rgba(0, 255, 136, 0.5), inset 0 0 20px rgba(0, 255, 136, 0.1)',
    },
  },
  {
    id: 'cyber',
    label: 'Cyber',
    css: {
      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(148, 0, 211, 0.2) 100%)',
      border: '2px solid rgba(0, 212, 255, 0.6)',
      boxShadow: '0 0 30px rgba(148, 0, 211, 0.3)',
    },
  },
  {
    id: 'gradient-border',
    label: 'Rainbow',
    css: {
      background: 'linear-gradient(#18181b, #18181b) padding-box, linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0, #8a2be2) border-box',
      border: '3px solid transparent',
    },
  },
  {
    id: 'frost',
    label: 'Frost',
    css: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(30px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.1)',
    },
  },
  {
    id: 'liquid',
    label: 'Liquid',
    css: {
      background: 'linear-gradient(135deg, rgba(255, 100, 50, 0.8) 0%, rgba(255, 50, 100, 0.8) 100%)',
      border: '2px solid rgba(255, 200, 100, 0.5)',
      boxShadow: '0 10px 40px rgba(255, 100, 50, 0.3)',
    },
  },
  {
    id: 'hologram',
    label: 'Holo',
    css: {
      background: 'linear-gradient(135deg, rgba(120, 200, 255, 0.3) 0%, rgba(200, 120, 255, 0.3) 50%, rgba(255, 180, 120, 0.3) 100%)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: '0 0 40px rgba(120, 200, 255, 0.2)',
    },
  },
  {
    id: 'inset-dark',
    label: 'Inset',
    css: {
      background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
      boxShadow: 'inset 5px 5px 15px #0d0d0d, inset -5px -5px 15px #333333',
    },
  },
  {
    id: 'outline',
    label: 'Outline',
    css: {
      background: 'transparent',
      border: '3px solid rgba(255, 255, 255, 0.8)',
    },
  },
  {
    id: 'border',
    label: 'Frame',
    css: {
      background: 'transparent',
      border: '8px solid #ffffff',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
    },
  },
  {
    id: 'double-border',
    label: 'Double',
    css: {
      background: 'transparent',
      border: '4px double rgba(255, 255, 255, 0.8)',
      boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.2)',
    },
  },
  {
    id: 'minimal',
    label: 'Minimal',
    css: {
      background: '#ffffff',
      border: '1px solid #e5e5e5',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
    },
  },
  {
    id: 'polaroid',
    label: 'Retro',
    css: {
      background: '#ffffff',
      border: 'none',
      padding: '12px 12px 36px 12px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    },
  },
  {
    id: 'glass-frosted',
    label: 'Frost',
    css: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(16px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    },
  },
  {
    id: 'neon-cyber',
    label: 'Cyber',
    css: {
      background: 'rgba(5, 5, 5, 0.9)',
      border: '1px solid #00f2ff',
      boxShadow: '0 0 15px rgba(0, 242, 255, 0.3), inset 0 0 15px rgba(0, 242, 255, 0.1)',
    },
  },
  {
    id: 'gradient-border',
    label: 'Gradient',
    css: {
      background: 'linear-gradient(#18181b, #18181b) padding-box, linear-gradient(45deg, #f43f5e, #8b5cf6) border-box',
      border: '3px solid transparent',
      boxShadow: '0 10px 30px -10px rgba(139, 92, 246, 0.3)',
    },
  },
];

export const BORDER_TYPES: BorderType[] = [
  { id: 'sharp', label: 'Sharp', radius: 0 },
  { id: 'curved', label: 'Curved', radius: 20 },
  { id: 'round', label: 'Round', radius: 50 },
];

export const SHADOW_TYPES: ShadowType[] = [
  { id: 'none', label: 'None' },
  { id: 'soft', label: 'Soft' },
  { id: 'float', label: 'Float' },
  { id: 'dream', label: 'Dream' },
  { id: 'glow', label: 'Glow' },
];

export const FRAMES_DATA = [
  {
    category: 'Social Media',
    frames: [
      { label: 'Instagram Post', width: 1080, height: 1080, ratio: '1:1' },
      { label: 'Instagram Portrait', width: 1080, height: 1350, ratio: '4:5' },
      { label: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16' },
      { label: 'Twitter Tweet', width: 1200, height: 675, ratio: '16:9' },
      { label: 'Twitter Header', width: 1500, height: 500, ratio: '3:1' },
      { label: 'YouTube Video', width: 1920, height: 1080, ratio: '16:9' },
      { label: 'Facebook Post', width: 1200, height: 630, ratio: '1.9:1' },
      { label: 'LinkedIn Post', width: 1200, height: 627, ratio: '1.9:1' },
      { label: 'Pinterest Standard', width: 1000, height: 1500, ratio: '2:3' },
    ]
  },
  {
    category: 'App Store (iOS)',
    frames: [
      { label: 'iPhone 6.5"', width: 1284, height: 2778, ratio: '19.5:9' },
      { label: 'iPhone 5.5"', width: 1242, height: 2208, ratio: '16:9' },
      { label: 'iPad Pro 12.9"', width: 2048, height: 2732, ratio: '4:3' },
      { label: 'Mac App Preview', width: 2880, height: 1800, ratio: '16:10' },
    ]
  },
  {
    category: 'Standard Ratios',
    frames: [
      { label: '16:9', width: 1920, height: 1080, ratio: '16:9' },
      { label: '4:3', width: 1600, height: 1200, ratio: '4:3' },
      { label: '1:1', width: 1080, height: 1080, ratio: '1:1' },
      { label: '9:16', width: 1080, height: 1920, ratio: '9:16' },
    ]
  }
];

export type LayoutAnimation = {
  type: 'float' | 'bounce' | 'rotate' | 'zoom' | 'zoom-in' | 'zoom-out' | 'zoom-up' | 'zoom-down' | 'slide' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'pulse' | 'swing' | 'shake' | 'flip' | 'spiral' | 'fan' | 'domino' | 'elastic-rotate' | 'converge' | 'diverge' | 'glitch' | 'wobble-3d' | 'rotate-3d' | 'elevator' | 'skew-slide' | 'none';
  duration: number;
  easing: string;
  intensity?: number;
  stagger?: number; // Delay between elements in ms for sequential animations
};

export type LayoutPreset = {
  id: string;
  name: string;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  backgroundGradient: string;
  icon: string;
  color: string;
  animations: LayoutAnimation[];
  durationMs: number;
};

export const LAYOUT_PRESETS: LayoutPreset[] = [
  // ═══════════════════════════════════════════════════════════════
  // SINGLE IMAGE - PRESENTATION ANIMATIONS
  // ═══════════════════════════════════════════════════════════════

  // Hero Introductions
  {
    id: 'hero-spotlight',
    name: 'Spotlight',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-950 via-slate-900 to-slate-950',
    icon: 'wb_sunny',
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
    animations: [{ type: 'zoom-in', duration: 3000, easing: 'ease-out', intensity: 1.15 }],
    durationMs: 3500,
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
    durationMs: 2500,
  },

  // Energetic Entrances
  {
    id: 'pop-entrance',
    name: 'Pop!',
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
    durationMs: 2000,
  },
  {
    id: 'bounce-drop',
    name: 'Drop In',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-violet-600 via-purple-600 to-indigo-600',
    icon: 'download',
    color: '#8B5CF6',
    animations: [{ type: 'zoom-down', duration: 1000, easing: 'ease-out', intensity: 1.15 }],
    durationMs: 2000,
  },
  {
    id: 'spring-up',
    name: 'Spring Up',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-emerald-500 via-green-500 to-teal-500',
    icon: 'north',
    color: '#10B981',
    animations: [
      { type: 'slide-up', duration: 800, easing: 'ease-out', intensity: 80 },
      { type: 'bounce', duration: 600, easing: 'ease-out', intensity: 10 },
    ],
    durationMs: 2200,
  },

  // Slide Presentations
  {
    id: 'slide-power',
    name: 'Power Slide',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-blue-700 via-blue-600 to-cyan-500',
    icon: 'trending_flat',
    color: '#3B82F6',
    animations: [{ type: 'slide-right', duration: 900, easing: 'ease-out', intensity: 120 }],
    durationMs: 1800,
  },
  {
    id: 'slide-reveal',
    name: 'Curtain',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-rose-700 via-red-600 to-orange-500',
    icon: 'open_in_full',
    color: '#F43F5E',
    animations: [{ type: 'slide-left', duration: 900, easing: 'ease-out', intensity: 120 }],
    durationMs: 1800,
  },

  // Atmospheric Effects
  {
    id: 'float-dream',
    name: 'Dreamy',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-sky-400 via-indigo-400 to-purple-500',
    icon: 'cloud',
    color: '#38BDF8',
    animations: [
      { type: 'float', duration: 3000, easing: 'ease-in-out', intensity: 20 },
    ],
    durationMs: 4000,
  },
  {
    id: 'float-orbit',
    name: 'Orbit',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-indigo-900 via-purple-900 to-slate-900',
    icon: 'public',
    color: '#6366F1',
    animations: [
      { type: 'float', duration: 2500, easing: 'ease-in-out', intensity: 15 },
      { type: 'rotate', duration: 8000, easing: 'linear', intensity: 360 },
    ],
    durationMs: 8000,
  },
  {
    id: 'heartbeat',
    name: 'Heartbeat',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-red-600 via-rose-600 to-pink-600',
    icon: 'favorite',
    color: '#EF4444',
    animations: [{ type: 'pulse', duration: 800, easing: 'ease-in-out', intensity: 1.12 }],
    durationMs: 2500,
  },

  // 3D Showcases
  {
    id: 'showcase-spin',
    name: '3D Spin',
    rotationX: 10,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-cyan-600 via-teal-600 to-emerald-600',
    icon: '360',
    color: '#14B8A6',
    animations: [{ type: 'rotate', duration: 5000, easing: 'linear', intensity: 360 }],
    durationMs: 5000,
  },
  {
    id: 'flip-card',
    name: 'Card Flip',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-amber-500 via-yellow-500 to-orange-500',
    icon: 'flip',
    color: '#F59E0B',
    animations: [{ type: 'flip', duration: 1800, easing: 'ease-in-out', intensity: 180 }],
    durationMs: 3000,
  },

  // Attention Grabbers
  {
    id: 'shake-alert',
    name: 'Alert!',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-red-600 via-orange-600 to-yellow-500',
    icon: 'warning',
    color: '#EA580C',
    animations: [{ type: 'shake', duration: 600, easing: 'ease-in-out', intensity: 10 }],
    durationMs: 1500,
  },
  {
    id: 'swing-playful',
    name: 'Playful',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-lime-500 via-green-500 to-emerald-500',
    icon: 'mood',
    color: '#84CC16',
    animations: [{ type: 'swing', duration: 1200, easing: 'ease-in-out', intensity: 12 }],
    durationMs: 2500,
  },

  // ═══════════════════════════════════════════════════════════════
  // DUAL IMAGE - PRESENTATION ANIMATIONS
  // ═══════════════════════════════════════════════════════════════

  // Comparison & Before/After
  {
    id: 'duo-versus',
    name: 'VS Battle',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-red-700 via-gray-900 to-blue-700',
    icon: 'compare',
    color: '#DC2626',
    animations: [
      { type: 'slide-left', duration: 800, easing: 'ease-out', intensity: 100 },
      { type: 'slide-right', duration: 800, easing: 'ease-out', intensity: 100 },
    ],
    durationMs: 2500,
  },
  {
    id: 'duo-transform',
    name: 'Transform',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-violet-700 via-purple-600 to-fuchsia-600',
    icon: 'auto_awesome',
    color: '#9333EA',
    animations: [
      { type: 'zoom-out', duration: 1000, easing: 'ease-out', intensity: 1.3 },
    ],
    durationMs: 2500,
  },

  // Sequential Reveals
  {
    id: 'duo-cascade',
    name: 'Cascade',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-blue-800 via-indigo-700 to-violet-700',
    icon: 'waterfall_chart',
    color: '#4F46E5',
    animations: [{ type: 'slide-down', duration: 800, easing: 'ease-out', intensity: 80 }],
    durationMs: 2500,
  },
  {
    id: 'duo-wave',
    name: 'Wave',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-cyan-600 via-blue-600 to-indigo-600',
    icon: 'waves',
    color: '#0891B2',
    animations: [{ type: 'slide-up', duration: 700, easing: 'ease-out', intensity: 70 }],
    durationMs: 2200,
  },

  // Synchronized Effects
  {
    id: 'duo-sync-pop',
    name: 'Sync Pop',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-pink-600 via-rose-500 to-red-500',
    icon: 'interests',
    color: '#EC4899',
    animations: [{ type: 'zoom-out', duration: 800, easing: 'ease-out', intensity: 1.4 }],
    durationMs: 2000,
  },
  {
    id: 'duo-dance',
    name: 'Dance',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-amber-500 via-orange-500 to-red-500',
    icon: 'sports_esports',
    color: '#F59E0B',
    animations: [{ type: 'bounce', duration: 700, easing: 'ease-out', intensity: 20 }],
    durationMs: 2200,
  },

  // Dramatic Reveals
  {
    id: 'duo-spotlight',
    name: 'Twin Lights',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-900 via-zinc-800 to-slate-900',
    icon: 'flare',
    color: '#FBBF24',
    animations: [
      { type: 'zoom-up', duration: 1000, easing: 'ease-out', intensity: 1.2 },
    ],
    durationMs: 2500,
  },
  {
    id: 'duo-flip-reveal',
    name: 'Double Flip',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-teal-600 via-cyan-600 to-sky-600',
    icon: 'autorenew',
    color: '#14B8A6',
    animations: [{ type: 'flip', duration: 1400, easing: 'ease-in-out', intensity: 180 }],
    durationMs: 3000,
  },

  // Playful Duos
  {
    id: 'duo-bounce-alt',
    name: 'Ping Pong',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-lime-500 via-green-500 to-teal-500',
    icon: 'sports_tennis',
    color: '#84CC16',
    animations: [
      { type: 'bounce', duration: 600, easing: 'ease-out', intensity: 25 },
      { type: 'swing', duration: 1000, easing: 'ease-in-out', intensity: 8 },
    ],
    durationMs: 2500,
  },
  {
    id: 'duo-float-sync',
    name: 'Float Pair',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-purple-600 via-violet-600 to-indigo-600',
    icon: 'bubble_chart',
    color: '#A855F7',
    animations: [{ type: 'float', duration: 2500, easing: 'ease-in-out', intensity: 18 }],
    durationMs: 4000,
  },

  // ═══════════════════════════════════════════════════════════════
  // TRIO IMAGES - SEQUENTIAL & STAGGERED ANIMATIONS
  // ═══════════════════════════════════════════════════════════════

  // One by One Reveals
  {
    id: 'trio-cascade-fall',
    name: 'Cascade Fall',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-indigo-900 via-purple-800 to-pink-700',
    icon: 'stacked_bar_chart',
    color: '#A855F7',
    animations: [{ type: 'slide-down', duration: 600, easing: 'ease-out', intensity: 100, stagger: 200 }],
    durationMs: 2500,
  },
  {
    id: 'trio-domino',
    name: 'Domino',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-900 via-zinc-800 to-neutral-900',
    icon: 'view_column',
    color: '#64748B',
    animations: [{ type: 'domino', duration: 800, easing: 'ease-out', intensity: 15, stagger: 150 }],
    durationMs: 2800,
  },
  {
    id: 'trio-pop-sequence',
    name: 'Pop Sequence',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-rose-600 via-pink-500 to-fuchsia-500',
    icon: 'bubble_chart',
    color: '#EC4899',
    animations: [{ type: 'zoom-out', duration: 500, easing: 'ease-out', intensity: 1.5, stagger: 180 }],
    durationMs: 2200,
  },
  {
    id: 'trio-wave-rise',
    name: 'Wave Rise',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-cyan-600 via-teal-500 to-emerald-500',
    icon: 'waves',
    color: '#14B8A6',
    animations: [{ type: 'slide-up', duration: 700, easing: 'ease-out', intensity: 120, stagger: 150 }],
    durationMs: 2600,
  },

  // Fan & Spiral Effects
  {
    id: 'trio-fan-out',
    name: 'Fan Out',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-amber-600 via-orange-500 to-red-500',
    icon: 'open_with',
    color: '#F59E0B',
    animations: [{ type: 'fan', duration: 900, easing: 'ease-out', intensity: 30, stagger: 120 }],
    durationMs: 2500,
  },
  {
    id: 'trio-spiral-in',
    name: 'Spiral In',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-violet-700 via-purple-600 to-indigo-600',
    icon: 'rotate_right',
    color: '#7C3AED',
    animations: [{ type: 'spiral', duration: 1000, easing: 'ease-out', intensity: 360, stagger: 200 }],
    durationMs: 3000,
  },

  // Bounce & Playful Sequences
  {
    id: 'trio-bounce-chain',
    name: 'Bounce Chain',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-lime-500 via-green-500 to-emerald-600',
    icon: 'sports_basketball',
    color: '#84CC16',
    animations: [{ type: 'bounce', duration: 600, easing: 'ease-out', intensity: 30, stagger: 200 }],
    durationMs: 2400,
  },
  {
    id: 'trio-swing-parade',
    name: 'Swing Parade',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-yellow-500 via-amber-500 to-orange-500',
    icon: 'emoji_people',
    color: '#FBBF24',
    animations: [{ type: 'swing', duration: 800, easing: 'ease-in-out', intensity: 20, stagger: 180 }],
    durationMs: 2800,
  },

  // Dramatic Entrances
  {
    id: 'trio-spotlight-reveal',
    name: 'Spotlight Reveal',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-black via-zinc-900 to-black',
    icon: 'flare',
    color: '#FBBF24',
    animations: [
      { type: 'zoom-up', duration: 800, easing: 'ease-out', intensity: 1.3, stagger: 250 },
      { type: 'pulse', duration: 600, easing: 'ease-in-out', intensity: 1.08 },
    ],
    durationMs: 3200,
  },
  {
    id: 'trio-flip-chain',
    name: 'Flip Chain',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-sky-600 via-blue-600 to-indigo-700',
    icon: 'flip',
    color: '#0EA5E9',
    animations: [{ type: 'flip', duration: 900, easing: 'ease-in-out', intensity: 180, stagger: 200 }],
    durationMs: 3000,
  },

  // Slide Combos
  {
    id: 'trio-slide-stack',
    name: 'Stack Up',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-blue-700 via-blue-600 to-cyan-500',
    icon: 'layers',
    color: '#3B82F6',
    animations: [{ type: 'slide-up', duration: 600, easing: 'ease-out', intensity: 150, stagger: 180 }],
    durationMs: 2400,
  },
  {
    id: 'trio-scatter',
    name: 'Scatter',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-fuchsia-600 via-pink-600 to-rose-600',
    icon: 'scatter_plot',
    color: '#D946EF',
    animations: [
      { type: 'slide-left', duration: 500, easing: 'ease-out', intensity: 80, stagger: 100 },
      { type: 'slide-right', duration: 500, easing: 'ease-out', intensity: 80, stagger: 100 },
    ],
    durationMs: 2000,
  },

  // ═══════════════════════════════════════════════════════════════
  // NEW CREATIVE PRESETS
  // ═══════════════════════════════════════════════════════════════

  // Single - Glitchy
  {
    id: 'hero-glitch',
    name: 'Cyber Glitch',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-gray-900 via-gray-800 to-black',
    icon: 'broken_image',
    color: '#22d3ee',
    animations: [
      { type: 'glitch', duration: 400, easing: 'linear', intensity: 5 },
      { type: 'zoom-in', duration: 200, easing: 'ease-out', intensity: 1.05 },
    ],
    durationMs: 2000,
  },

  // Duo - Converge
  {
    id: 'duo-converge',
    name: 'Magnetic',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-indigo-500 via-purple-500 to-pink-500',
    icon: 'join_inner',
    color: '#818cf8',
    animations: [
      { type: 'converge', duration: 800, easing: 'ease-out', intensity: 100 },
    ],
    durationMs: 2500,
  },

  // Trio - Wobble 3D
  {
    id: 'trio-wobble',
    name: '3D Float',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-teal-400 via-emerald-400 to-green-400',
    icon: '3d_rotation',
    color: '#34d399',
    animations: [
      { type: 'wobble-3d', duration: 2000, easing: 'ease-in-out', intensity: 10, stagger: 300 },
    ],
    durationMs: 4000,
  },

  // Quad - Elastic
  {
    id: 'quad-elastic',
    name: 'Elastic Grid',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-orange-400 via-red-400 to-pink-400',
    icon: 'grid_view',
    color: '#fb923c',
    animations: [
      { type: 'elastic-rotate', duration: 1200, easing: 'ease-out', intensity: 5, stagger: 100 },
      { type: 'zoom-in', duration: 800, easing: 'ease-out', intensity: 1.1, stagger: 100 },
    ],
    durationMs: 3000,
  },

  // ═══════════════════════════════════════════════════════════════
  // 3D & PRESENTATION PRESETS
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'present-3d-spin',
    name: '3D Cube',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-blue-900 via-slate-900 to-black',
    icon: 'view_in_ar',
    color: '#60a5fa',
    animations: [
      { type: 'rotate-3d', duration: 4000, easing: 'linear', intensity: 360 },
    ],
    durationMs: 4000,
  },

  {
    id: 'present-elevator',
    name: 'Elevator Pitch',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-emerald-900 via-green-900 to-black',
    icon: 'elevator',
    color: '#4ade80',
    animations: [
      { type: 'elevator', duration: 1500, easing: 'ease-out', intensity: 1 },
    ],
    durationMs: 2500,
  },

  {
    id: 'present-skew',
    name: 'Dynamic Skew',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-purple-900 via-fuchsia-900 to-black',
    icon: 'bolt',
    color: '#d8b4fe',
    animations: [
      { type: 'skew-slide', duration: 1200, easing: 'ease-out', intensity: 30 },
    ],
    durationMs: 2000,
  },
];

export const getShadowStyle = (
  shadowType: string,
  shadowOpacity: number,
  rotationX: number = 0,
  rotationY: number = 0
): string => {
  const opacity = shadowOpacity / 100;

  switch (shadowType) {
    case 'none':
      return 'none';
    case 'spread':
      return `-20px 40px 60px rgba(0, 0, 0, ${opacity})`;
    case 'hug':
      return `0 10px 30px rgba(0, 0, 0, ${opacity})`;
    case 'adaptive':
      const xOffset = Math.sin(rotationY * Math.PI / 180) * 40;
      const yOffset = Math.cos(rotationX * Math.PI / 180) * 40;
      return `${xOffset}px ${yOffset}px 60px rgba(0, 0, 0, ${opacity})`;
    default:
      return `-20px 40px 60px rgba(0, 0, 0, ${opacity})`;
  }
};
