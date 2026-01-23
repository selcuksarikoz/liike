import { memo, type ReactNode, type CSSProperties } from 'react';

export type ShadowType = 'none' | 'drop' | 'glow' | 'soft' | 'hard' | 'spread';

export type ShadowGlowProps = {
  children: ReactNode;
  type: ShadowType;
  color: string;
  opacity: number; // 0-100
  blur: number;
  offsetX: number;
  offsetY: number;
  spread?: number;
  cornerRadius: number;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

// Generate box-shadow CSS based on type
const generateBoxShadow = (
  type: ShadowType,
  color: string,
  opacity: number,
  blur: number,
  offsetX: number,
  offsetY: number,
  spread: number = 0
): string | undefined => {
  if (type === 'none') return undefined;

  // Parse color to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const alpha = Math.max(0, Math.min(1, opacity / 100));

  const rgba = `rgba(${r}, ${g}, ${b}, ${alpha})`;

  switch (type) {
    case 'drop':
      // Standard drop shadow
      return `${offsetX}px ${offsetY}px ${blur}px ${rgba}`;

    case 'glow':
      // Glow effect - no offset, larger blur, spread
      return `0 0 ${blur * 1.5}px ${spread + 10}px ${rgba}`;

    case 'soft':
      // Soft shadow - larger blur, less opacity feel
      return `${offsetX}px ${offsetY}px ${blur * 2}px ${spread}px ${rgba}`;

    case 'hard':
      // Hard shadow - minimal blur
      return `${offsetX}px ${offsetY}px ${Math.max(2, blur * 0.3)}px ${rgba}`;

    case 'spread':
      // Spread shadow - emphasizes spread
      return `${offsetX}px ${offsetY}px ${blur}px ${spread + 15}px ${rgba}`;

    default:
      return undefined;
  }
};

export const ShadowGlow = memo(
  ({
    children,
    type,
    color,
    opacity,
    blur,
    offsetX,
    offsetY,
    spread = 0,
    cornerRadius,
    disabled = false,
    className = '',
    style = {},
  }: ShadowGlowProps) => {
    const boxShadow =
      disabled || type === 'none'
        ? undefined
        : generateBoxShadow(type, color, opacity, blur, offsetX, offsetY, spread);

    return (
      <div
        className={`w-full h-full overflow-hidden ${className}`}
        style={{
          borderRadius: `${cornerRadius}px`,
          boxShadow,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);

// Utility to convert legacy dropShadowFilter to ShadowGlowProps
export const parseLegacyDropShadow = (
  dropShadowFilter: string | undefined
): Partial<ShadowGlowProps> | null => {
  if (!dropShadowFilter || dropShadowFilter === 'none') return null;

  // Parse drop-shadow(Xpx Ypx Zpx rgba(r, g, b, a))
  const match = dropShadowFilter.match(
    /drop-shadow\((-?\d+)px\s+(-?\d+)px\s+(\d+)px\s+rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)\)/
  );

  if (!match) return null;

  const [, x, y, blur, r, g, b, a] = match;

  // Convert RGB to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  const color = `#${toHex(parseInt(r))}${toHex(parseInt(g))}${toHex(parseInt(b))}`;

  return {
    type: 'drop',
    offsetX: parseInt(x),
    offsetY: parseInt(y),
    blur: parseInt(blur),
    color,
    opacity: parseFloat(a) * 100,
  };
};
