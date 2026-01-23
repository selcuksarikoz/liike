import type { CSSProperties, ReactNode } from 'react';
import type { MediaAsset, AspectRatio } from '../../store/renderStore';
import type { AnimationInfo } from '../../utils/animationHelpers';

// Helper to strip dropShadow from styleCSS for container usage
export const getContainerCSS = (styleCSS: CSSProperties & { dropShadow?: string }) => {
  const { dropShadow: _, ...containerCSS } = styleCSS;
  return containerCSS;
};

// Helper to calculate item style that respects aspect ratio while staying within bounds
// Implements "contain" behavior - fills as much space as possible without overflow
export const getContainedItemStyle = (
  aspectValue: number | null,
  baseStyle?: CSSProperties
): CSSProperties => {
  const base = baseStyle || {};
  
  if (!aspectValue) {
    // Free aspect ratio - let flex handle sizing
    return {
      ...base,
      flex: 1,
      minWidth: 0,
      minHeight: 0,
    };
  }

  // With aspect ratio, use contain behavior
  return {
    ...base,
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    aspectRatio: aspectValue,
    // Let container handle max constraints with overflow:hidden
  };
};

export type LayoutBaseProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  containerStyle: CSSProperties;
  mediaAssets: (MediaAsset | null)[];
  effectiveCornerRadius: number;
  styleCSS: CSSProperties & { dropShadow?: string };
  isPreview: boolean;
  onScreenClick?: (index: number) => void;
  playing: boolean;
  animationInfo?: AnimationInfo;
  aspectValue: number | null;
  sizePercent: string;
  renderWithMockup: (content: ReactNode, key?: number | string) => ReactNode;
  cornerRadius?: number;
};
