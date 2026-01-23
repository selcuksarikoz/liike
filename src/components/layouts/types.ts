import type { ReactNode } from 'react';
import type { MediaAsset, AspectRatio } from '../../store/renderStore';
import type { AnimationInfo } from '../../utils/animationHelpers';

export type LayoutBaseProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  containerStyle: React.CSSProperties;
  mediaAssets: (MediaAsset | null)[];
  effectiveCornerRadius: number;
  shadowFilter: string; // Combined drop-shadow filter for media elements
  styleCSS: React.CSSProperties & { dropShadow?: string };
  isPreview: boolean;
  onScreenClick?: (index: number) => void;
  playing: boolean;
  animationInfo?: AnimationInfo;
  aspectValue: number | null;
  sizePercent: string;
  renderWithMockup: (content: ReactNode, key?: number | string) => ReactNode;
};
