import { MediaContainer } from '../MediaContainer';
import type { LayoutBaseProps } from './types';

export const SingleLayout = ({
  containerRef,
  containerStyle,
  mediaAssets,
  effectiveCornerRadius,
  styleCSS,
  isPreview,
  onScreenClick,
  playing,
  aspectValue,
  sizePercent,
  renderWithMockup,
}: LayoutBaseProps) => {
  const mediaContent = (
    <MediaContainer
      index={0}
      media={mediaAssets[0]}
      cornerRadius={effectiveCornerRadius}
      isPreview={isPreview}
      onScreenClick={onScreenClick}
      styleCSS={styleCSS}
      playing={playing}
    />
  );

  // Calculate container dimensions that respect aspect ratio while staying within bounds
  // This implements a "contain" behavior - media fills as much space as possible without overflow
  const getContainerStyle = () => {
    const baseStyle = {
      ...containerStyle,
      backfaceVisibility: 'hidden' as const,
    };

    if (!aspectValue) {
      // Free aspect ratio - fill available space
      return {
        ...baseStyle,
        width: sizePercent,
        height: sizePercent,
        maxWidth: sizePercent,
        maxHeight: sizePercent,
      };
    }

    // With aspect ratio constraint, use CSS aspect-ratio with max constraints
    // This ensures the content never exceeds the container
    return {
      ...baseStyle,
      width: 'auto',
      height: 'auto',
      aspectRatio: aspectValue,
      maxWidth: sizePercent,
      maxHeight: sizePercent,
    };
  };

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        ref={containerRef}
        className="relative transition-[transform,border-radius] duration-300 ease-out"
        style={getContainerStyle()}
      >
        {renderWithMockup(mediaContent)}
      </div>
    </div>
  );
};
