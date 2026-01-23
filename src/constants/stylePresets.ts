export type StylePreset = {
  id: string;
  label: string;
  css: {
    background?: string;
    backdropFilter?: string;
    border?: string;
    boxShadow?: string;
    opacity?: number;
    padding?: string;
  };
  preview?: string;
};

export type BorderType = {
  id: 'sharp' | 'curved' | 'round';
  label: string;
  radius: number;
};

export type ShadowType = {
  id: 'none' | 'soft' | 'float' | 'dream' | 'glow';
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
    id: 'gradient-glow',
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
