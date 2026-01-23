import { MediaContainer } from '../MediaContainer';
import { getStaggeredAnimationStyle, getLayoutTransition } from '../../utils/animationHelpers';
import type { LayoutBaseProps } from './types';

// Side by side layout (2 images)
export const SideBySideLayout = ({
  containerRef,
  containerStyle,
  mediaAssets,
  effectiveCornerRadius,
  shadowFilter,
  styleCSS,
  isPreview,
  onScreenClick,
  playing,
  animationInfo,
  aspectValue,
  sizePercent,
  renderWithMockup,
}: LayoutBaseProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        ref={containerRef}
        className="relative flex gap-4 transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          width: isPreview ? '100%' : '90%',
          height: isPreview ? '100%' : '90%',
          maxWidth: sizePercent,
          maxHeight: sizePercent,
        }}
      >
        {[0, 1].map((index) => {
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 2);
          return (
            <div
              key={index}
              className="flex-1 min-w-0 min-h-0 overflow-hidden"
              style={{
                aspectRatio: aspectValue ? aspectValue : undefined,
                transform: animStyle.transform,
                opacity: animStyle.opacity,
                transition: getLayoutTransition(!!animationInfo),
                willChange: 'transform, opacity',
              }}
            >
              {renderWithMockup(
                <MediaContainer
                  index={index}
                  media={mediaAssets[index]}
                  cornerRadius={effectiveCornerRadius}
                  isPreview={isPreview}
                  onScreenClick={onScreenClick}
                  styleCSS={styleCSS}
                  dropShadowFilter={shadowFilter}
                  playing={playing}
                />,
                index
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Stacked layout (2 images)
export const StackedLayout = ({
  containerRef,
  containerStyle,
  mediaAssets,
  effectiveCornerRadius,
  shadowFilter,
  styleCSS,
  isPreview,
  onScreenClick,
  playing,
  animationInfo,
  aspectValue,
  sizePercent,
  renderWithMockup,
}: LayoutBaseProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        ref={containerRef}
        className="relative flex flex-col gap-4 transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          width: isPreview ? '100%' : '90%',
          height: isPreview ? '100%' : '90%',
          maxWidth: sizePercent,
          maxHeight: sizePercent,
        }}
      >
        {[0, 1].map((index) => {
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 2);
          return (
            <div
              key={index}
              className="flex-1 min-w-0 min-h-0 overflow-hidden"
              style={{
                aspectRatio: aspectValue ? aspectValue : undefined,
                transform: animStyle.transform,
                opacity: animStyle.opacity,
                transition: getLayoutTransition(!!animationInfo),
                willChange: 'transform, opacity',
              }}
            >
              {renderWithMockup(
                <MediaContainer
                  index={index}
                  media={mediaAssets[index]}
                  cornerRadius={effectiveCornerRadius}
                  isPreview={isPreview}
                  onScreenClick={onScreenClick}
                  styleCSS={styleCSS}
                  dropShadowFilter={shadowFilter}
                  playing={playing}
                />,
                index
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Diagonal layout (2 images at angles)
export const DiagonalLayout = ({
  containerRef,
  containerStyle,
  mediaAssets,
  effectiveCornerRadius,
  shadowFilter,
  styleCSS,
  isPreview,
  onScreenClick,
  playing,
  animationInfo,
  aspectValue,
  renderWithMockup,
}: LayoutBaseProps) => {
  const diagonalConfigs = [
    { x: 5, y: 15, rotate: -12, zIndex: 20 },
    { x: 35, y: 25, rotate: 8, zIndex: 30 },
  ];

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        ref={containerRef}
        className="relative transition-transform duration-300 ease-out overflow-hidden"
        style={{ ...containerStyle, width: '90%', height: '90%' }}
      >
        {[0, 1].map((index) => {
          const config = diagonalConfigs[index];
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 2);
          return (
            <div
              key={index}
              className="absolute"
              style={{
                width: '55%',
                aspectRatio: aspectValue || 3 / 4,
                left: `${config.x}%`,
                top: `${config.y}%`,
                zIndex: config.zIndex,
                transform: `rotate(${config.rotate}deg) ${animStyle.transform}`,
                opacity: animStyle.opacity,
                transition: getLayoutTransition(!!animationInfo),
              }}
            >
              {renderWithMockup(
                <MediaContainer
                  index={index}
                  media={mediaAssets[index]}
                  cornerRadius={effectiveCornerRadius}
                  isPreview={isPreview}
                  onScreenClick={onScreenClick}
                  styleCSS={styleCSS}
                  dropShadowFilter={shadowFilter}
                  playing={playing}
                />,
                index
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Polaroid layout (2 images like polaroid photos)
export const PolaroidLayout = ({
  containerRef,
  containerStyle,
  mediaAssets,
  shadowFilter,
  styleCSS,
  isPreview,
  onScreenClick,
  playing,
  animationInfo,
}: LayoutBaseProps) => {
  const polaroidConfigs = [
    { x: 10, y: 20, rotate: -8 },
    { x: 40, y: 15, rotate: 6 },
  ];

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        ref={containerRef}
        className="relative transition-transform duration-300 ease-out overflow-hidden"
        style={{ ...containerStyle, width: '90%', height: '90%' }}
      >
        {[0, 1].map((index) => {
          const config = polaroidConfigs[index];
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 2);
          return (
            <div
              key={index}
              className="absolute bg-white p-2 pb-8"
              style={{
                width: '45%',
                left: `${config.x}%`,
                top: `${config.y}%`,
                zIndex: 20 + index * 10,
                borderRadius: '4px',
                transform: `rotate(${config.rotate}deg) ${animStyle.transform}`,
                opacity: animStyle.opacity,
                transition: getLayoutTransition(!!animationInfo),
              }}
            >
              <div style={{ aspectRatio: 1 }}>
                <MediaContainer
                  index={index}
                  media={mediaAssets[index]}
                  cornerRadius={2}
                  isPreview={isPreview}
                  onScreenClick={onScreenClick}
                  styleCSS={styleCSS}
                  dropShadowFilter={shadowFilter}
                  playing={playing}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
