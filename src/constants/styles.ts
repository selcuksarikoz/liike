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
    label: 'Glass Light',
    css: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
  },
  {
    id: 'glass-dark',
    label: 'Glass Dark',
    css: {
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  },
  {
    id: 'liquid',
    label: 'Liquid',
    css: {
      background: 'linear-gradient(135deg, rgba(255,165,0,0.8) 0%, rgba(255,100,50,0.8) 100%)',
      border: '2px solid rgba(255, 200, 100, 0.5)',
    },
  },
  {
    id: 'inset-light',
    label: 'Inset Light',
    css: {
      background: 'linear-gradient(145deg, #f0f0f0, #cacaca)',
      boxShadow: 'inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff',
    },
  },
  {
    id: 'inset-dark',
    label: 'Inset Dark',
    css: {
      background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
      boxShadow: 'inset 5px 5px 10px #0d0d0d, inset -5px -5px 10px #333333',
    },
  },
  {
    id: 'outline',
    label: 'Outline',
    css: {
      background: 'transparent',
      border: '3px solid currentColor',
    },
  },
  {
    id: 'border',
    label: 'Border',
    css: {
      background: 'transparent',
      border: '8px solid #ffffff',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
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
  { id: 'spread', label: 'Spread' },
  { id: 'hug', label: 'Hug' },
  { id: 'adaptive', label: 'Adaptive' },
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
  type: 'float' | 'bounce' | 'rotate' | 'zoom' | 'slide' | 'pulse' | 'swing' | 'none';
  duration: number;
  easing: string;
  intensity?: number;
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
  // Static Layouts
  {
    id: 'frontal',
    name: 'Frontal',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-fuchsia-600 to-purple-600',
    icon: 'crop_square',
    color: '#A855F7',
    animations: [{ type: 'none', duration: 0, easing: 'linear' }],
    durationMs: 2000,
  },
  {
    id: 'isometric-right',
    name: 'Isometric Right',
    rotationX: 20,
    rotationY: -25,
    rotationZ: 10,
    backgroundGradient: 'from-orange-500 to-pink-500',
    icon: 'view_in_ar',
    color: '#F97316',
    animations: [{ type: 'none', duration: 0, easing: 'linear' }],
    durationMs: 2000,
  },
  {
    id: 'isometric-left',
    name: 'Isometric Left',
    rotationX: 20,
    rotationY: 25,
    rotationZ: -10,
    backgroundGradient: 'from-blue-500 to-indigo-500',
    icon: 'view_in_ar',
    color: '#3B82F6',
    animations: [{ type: 'none', duration: 0, easing: 'linear' }],
    durationMs: 2000,
  },

  // Animated Layouts
  {
    id: 'float-gentle',
    name: 'Gentle Float',
    rotationX: 10,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-cyan-400 to-blue-500',
    icon: 'cloud',
    color: '#22D3EE',
    animations: [{ type: 'float', duration: 2000, easing: 'ease-in-out', intensity: 15 }],
    durationMs: 3000,
  },
  {
    id: 'bounce-playful',
    name: 'Playful Bounce',
    rotationX: 5,
    rotationY: -10,
    rotationZ: 0,
    backgroundGradient: 'from-pink-500 to-rose-500',
    icon: 'sports_basketball',
    color: '#EC4899',
    animations: [{ type: 'bounce', duration: 800, easing: 'ease-out', intensity: 20 }],
    durationMs: 2500,
  },
  {
    id: 'rotate-showcase',
    name: 'Showcase Spin',
    rotationX: 15,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-violet-500 to-purple-600',
    icon: '360',
    color: '#8B5CF6',
    animations: [{ type: 'rotate', duration: 4000, easing: 'linear', intensity: 360 }],
    durationMs: 4000,
  },
  {
    id: 'zoom-dramatic',
    name: 'Dramatic Zoom',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-slate-800 to-slate-900',
    icon: 'zoom_in',
    color: '#64748B',
    animations: [{ type: 'zoom', duration: 1500, easing: 'ease-out', intensity: 1.2 }],
    durationMs: 2000,
  },
  {
    id: 'slide-enter',
    name: 'Slide Enter',
    rotationX: 5,
    rotationY: -15,
    rotationZ: 3,
    backgroundGradient: 'from-emerald-400 to-teal-500',
    icon: 'swipe_right',
    color: '#34D399',
    animations: [{ type: 'slide', duration: 1000, easing: 'ease-out', intensity: 100 }],
    durationMs: 2000,
  },
  {
    id: 'pulse-attention',
    name: 'Attention Pulse',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-red-500 to-orange-500',
    icon: 'favorite',
    color: '#EF4444',
    animations: [{ type: 'pulse', duration: 600, easing: 'ease-in-out', intensity: 1.1 }],
    durationMs: 2000,
  },

  // Combo Animated Layouts (max 2 animations)
  {
    id: 'float-rotate',
    name: 'Float + Rotate',
    rotationX: 10,
    rotationY: 0,
    rotationZ: 5,
    backgroundGradient: 'from-sky-400 to-indigo-500',
    icon: 'cyclone',
    color: '#38BDF8',
    animations: [
      { type: 'float', duration: 2000, easing: 'ease-in-out', intensity: 12 },
      { type: 'rotate', duration: 6000, easing: 'linear', intensity: 360 },
    ],
    durationMs: 6000,
  },
  {
    id: 'bounce-zoom',
    name: 'Bounce + Zoom',
    rotationX: 5,
    rotationY: -5,
    rotationZ: 0,
    backgroundGradient: 'from-amber-400 to-orange-500',
    icon: 'rocket_launch',
    color: '#FBBF24',
    animations: [
      { type: 'bounce', duration: 600, easing: 'ease-out', intensity: 15 },
      { type: 'zoom', duration: 2000, easing: 'ease-in-out', intensity: 1.15 },
    ],
    durationMs: 3000,
  },
  {
    id: 'slide-swing',
    name: 'Slide + Swing',
    rotationX: 8,
    rotationY: 10,
    rotationZ: -5,
    backgroundGradient: 'from-lime-400 to-green-500',
    icon: 'moving',
    color: '#84CC16',
    animations: [
      { type: 'slide', duration: 800, easing: 'ease-out', intensity: 80 },
      { type: 'swing', duration: 1500, easing: 'ease-in-out', intensity: 8 },
    ],
    durationMs: 3500,
  },
  {
    id: 'pulse-float',
    name: 'Pulse + Float',
    rotationX: 5,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-fuchsia-500 to-pink-500',
    icon: 'favorite',
    color: '#D946EF',
    animations: [
      { type: 'pulse', duration: 800, easing: 'ease-in-out', intensity: 1.08 },
      { type: 'float', duration: 2500, easing: 'ease-in-out', intensity: 10 },
    ],
    durationMs: 4000,
  },

  // Sequential Animations for Dual Images
  {
    id: 'sequential-reveal',
    name: 'Sequential Reveal',
    rotationX: 10,
    rotationY: -5,
    rotationZ: 0,
    backgroundGradient: 'from-violet-600 to-indigo-600',
    icon: 'view_carousel',
    color: '#7C3AED',
    animations: [
      { type: 'slide', duration: 600, easing: 'ease-out', intensity: 80 },
      { type: 'zoom', duration: 1000, easing: 'ease-out', intensity: 1.05 },
    ],
    durationMs: 2500,
  },
  {
    id: 'mirror-slide',
    name: 'Mirror Slide',
    rotationX: 5,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-rose-500 to-pink-600',
    icon: 'compare',
    color: '#F43F5E',
    animations: [
      { type: 'slide', duration: 800, easing: 'ease-out', intensity: 60 },
      { type: 'float', duration: 1500, easing: 'ease-in-out', intensity: 8 },
    ],
    durationMs: 3000,
  },
  {
    id: 'stagger-bounce',
    name: 'Stagger Bounce',
    rotationX: 8,
    rotationY: -8,
    rotationZ: 2,
    backgroundGradient: 'from-yellow-400 to-amber-500',
    icon: 'stacked_line_chart',
    color: '#F59E0B',
    animations: [
      { type: 'bounce', duration: 500, easing: 'ease-out', intensity: 25 },
      { type: 'swing', duration: 1200, easing: 'ease-in-out', intensity: 5 },
    ],
    durationMs: 2800,
  },
  {
    id: 'duo-zoom',
    name: 'Duo Zoom',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-teal-500 to-cyan-600',
    icon: 'center_focus_strong',
    color: '#14B8A6',
    animations: [
      { type: 'zoom', duration: 1200, easing: 'ease-in-out', intensity: 1.15 },
      { type: 'pulse', duration: 600, easing: 'ease-in-out', intensity: 1.05 },
    ],
    durationMs: 3000,
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
