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

export const LAYOUT_PRESETS = [
  {
    name: 'Frontal',
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'from-fuchsia-600 to-purple-600',
  },
  {
    name: 'Isometric Right',
    rotationX: 20,
    rotationY: -25,
    rotationZ: 10,
    backgroundGradient: 'from-orange-500 to-pink-500',
  },
  {
    name: 'Isometric Left',
    rotationX: 20,
    rotationY: 25,
    rotationZ: -10,
    backgroundGradient: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'Floating',
    rotationX: 15,
    rotationY: 0,
    rotationZ: 5,
    backgroundGradient: 'from-teal-400 to-emerald-500',
  },
  {
    name: 'Dynamic',
    rotationX: 10,
    rotationY: -40,
    rotationZ: 5,
    backgroundGradient: 'from-rose-500 to-orange-400',
  }
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
