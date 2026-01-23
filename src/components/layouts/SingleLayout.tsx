import { MediaContainer } from '../MediaContainer';
import type { LayoutBaseProps } from './types';

export const SingleLayout = ({
  containerRef,
  containerStyle,
  mediaAssets,
  effectiveCornerRadius,
  shadowFilter,
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
      dropShadowFilter={shadowFilter}
      playing={playing}
    />
  );

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        ref={containerRef}
        className="relative transition-[transform,border-radius] duration-300 ease-out"
        style={{
          ...containerStyle,
          width: aspectValue ? 'auto' : sizePercent,
          height: aspectValue ? sizePercent : sizePercent,
          aspectRatio: aspectValue ? aspectValue : undefined,
          maxWidth: sizePercent,
          maxHeight: sizePercent,
          backfaceVisibility: 'hidden',
        }}
      >
        {renderWithMockup(mediaContent)}
      </div>
    </div>
  );
};
