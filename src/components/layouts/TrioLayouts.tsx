import { MediaContainer } from '../MediaContainer';
import { getStaggeredAnimationStyle, getLayoutTransition } from '../../utils/animationHelpers';
import { getContainerCSS, type LayoutBaseProps } from './types';

// Trio row layout (3 images horizontal)
export const TrioRowLayout = ({
  containerRef,
  containerStyle,
  mediaAssets,
  effectiveCornerRadius,
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
        className="relative flex gap-3 transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          width: isPreview ? '100%' : '95%',
          height: isPreview ? '100%' : '90%',
          maxWidth: isPreview ? '100%' : sizePercent,
          maxHeight: isPreview ? '100%' : sizePercent,
        }}
      >
        {[0, 1, 2].map((index) => {
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 3);
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

// Trio column layout (3 images vertical)
export const TrioColumnLayout = ({
  containerRef,
  containerStyle,
  mediaAssets,
  effectiveCornerRadius,
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
        className="relative flex flex-col gap-3 transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          width: isPreview ? '100%' : '95%',
          height: isPreview ? '100%' : '95%',
          maxWidth: isPreview ? '100%' : sizePercent,
          maxHeight: isPreview ? '100%' : sizePercent,
        }}
      >
        {[0, 1, 2].map((index) => {
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 3);
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

// Fan/Triptych layout (3 equal panels)
export const FanLayout = ({
  containerRef,
  containerStyle,
  mediaAssets,
  effectiveCornerRadius,
  styleCSS,
  isPreview,
  onScreenClick,
  playing,
  animationInfo,
  renderWithMockup,
  sizePercent,
}: LayoutBaseProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 overflow-hidden">
      <div
        ref={containerRef}
        className="relative flex gap-2 transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          width: '95%',
          height: '75%',
          maxWidth: sizePercent,
          maxHeight: sizePercent,
        }}
      >
        {[0, 1, 2].map((index) => {
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 3);
          return (
            <div
              key={index}
              className="flex-1 min-w-0 min-h-0 overflow-hidden"
              style={{
                transform: animStyle.transform,
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

// Masonry layout
export const MasonryLayout = ({
  containerRef,
  containerStyle,
  mediaAssets,
  effectiveCornerRadius,
  styleCSS,
  isPreview,
  onScreenClick,
  playing,
  animationInfo,
  sizePercent,
}: LayoutBaseProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 overflow-hidden">
      <div
        ref={containerRef}
        className="relative grid grid-cols-2 gap-2 transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          width: isPreview ? '100%' : '85%',
          height: isPreview ? '100%' : '85%',
          maxWidth: isPreview ? '100%' : sizePercent,
          maxHeight: isPreview ? '100%' : sizePercent,
          gridTemplateRows: '1.5fr 1fr',
        }}
      >
        <div
          className="relative row-span-2"
          style={{
            transform: getStaggeredAnimationStyle(animationInfo, 0, 4).transform,
            opacity: getStaggeredAnimationStyle(animationInfo, 0, 4).opacity,
            transition: getLayoutTransition(!!animationInfo),
          }}
        >
          <MediaContainer
            index={0}
            media={mediaAssets[0]}
            cornerRadius={effectiveCornerRadius}
            isPreview={isPreview}
            onScreenClick={onScreenClick}
            styleCSS={styleCSS}
            playing={playing}
          />
        </div>
        <div
          className="relative"
          style={{
            transform: getStaggeredAnimationStyle(animationInfo, 1, 4).transform,
            opacity: getStaggeredAnimationStyle(animationInfo, 1, 4).opacity,
            transition: getLayoutTransition(!!animationInfo),
          }}
        >
          <MediaContainer
            index={1}
            media={mediaAssets[1]}
            cornerRadius={effectiveCornerRadius}
            isPreview={isPreview}
            onScreenClick={onScreenClick}
            styleCSS={styleCSS}
            playing={playing}
          />
        </div>
        <div
          className="relative"
          style={{
            transform: getStaggeredAnimationStyle(animationInfo, 2, 4).transform,
            opacity: getStaggeredAnimationStyle(animationInfo, 2, 4).opacity,
            transition: getLayoutTransition(!!animationInfo),
          }}
        >
          <MediaContainer
            index={2}
            media={mediaAssets[2]}
            cornerRadius={effectiveCornerRadius}
            isPreview={isPreview}
            onScreenClick={onScreenClick}
            styleCSS={styleCSS}
            playing={playing}
          />
        </div>
      </div>
    </div>
  );
};

// Mosaic layout (complex grid)
export const MosaicLayout = ({
  containerRef,
  containerStyle,
  mediaAssets,
  effectiveCornerRadius,
  styleCSS,
  isPreview,
  onScreenClick,
  playing,
  animationInfo,
  sizePercent,
  renderWithMockup,
}: LayoutBaseProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 overflow-hidden">
      <div
        ref={containerRef}
        className="relative grid grid-cols-2 grid-rows-2 gap-3 transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          width: isPreview ? '100%' : '90%',
          height: isPreview ? '100%' : '80%',
          maxWidth: isPreview ? '100%' : sizePercent,
          maxHeight: isPreview ? '100%' : sizePercent,
        }}
      >
        {[0, 1, 2].map((index) => {
          const isHero = index === 0;
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 3);
          return (
            <div
              key={index}
              className={`relative ${isHero ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1'}`}
              style={{
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

// Film Strip layout
export const FilmStripLayout = ({
  containerRef,
  containerStyle,
  mediaAssets,
  effectiveCornerRadius,
  styleCSS,
  isPreview,
  onScreenClick,
  playing,
  animationInfo,
  sizePercent,
}: LayoutBaseProps & { cornerRadius: number }) => {
  const containerCSS = getContainerCSS(styleCSS);

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        ref={containerRef}
        className="relative flex flex-col gap-4 transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          width: isPreview ? '100%' : '60%',
          height: isPreview ? '100%' : '90%',
          maxWidth: isPreview ? '100%' : sizePercent,
          maxHeight: isPreview ? '100%' : sizePercent,
        }}
      >
        {[0, 1, 2].map((index) => {
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 3);
          return (
            <div
              key={index}
              className="flex-1 overflow-hidden relative"
              style={{
                borderRadius: `${effectiveCornerRadius}px`,
                transform: `skewY(-5deg) ${animStyle.transform === 'none' ? '' : animStyle.transform}`,
                opacity: animStyle.opacity,
                transition: getLayoutTransition(!!animationInfo),
                willChange: 'transform, opacity',
                ...containerCSS,
              }}
            >
              {/* Film holes decoration */}
              <div className="absolute left-2 top-0 bottom-0 w-4 flex flex-col justify-between py-2 z-20 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-full h-3 bg-white/20 rounded-sm" />
                ))}
              </div>
              <div className="absolute right-2 top-0 bottom-0 w-4 flex flex-col justify-between py-2 z-20 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-full h-3 bg-white/20 rounded-sm" />
                ))}
              </div>

              <div className="absolute inset-0 px-8 py-1">
                <MediaContainer
                  index={index}
                  media={mediaAssets[index]}
                  cornerRadius={Math.max(2, effectiveCornerRadius - 4)}
                  isPreview={isPreview}
                  onScreenClick={onScreenClick}
                  styleCSS={styleCSS}
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

// Spotlight layout (1 large + 2 small)
export const SpotlightLayout = ({
  containerRef,
  containerStyle,
  mediaAssets,
  effectiveCornerRadius,
  styleCSS,
  isPreview,
  onScreenClick,
  playing,
  animationInfo,
  sizePercent,
}: LayoutBaseProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 overflow-hidden">
      <div
        ref={containerRef}
        className="relative flex gap-3 transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          width: '95%',
          height: '85%',
          maxWidth: sizePercent,
          maxHeight: sizePercent,
        }}
      >
        <div
          className="flex-[2]"
          style={{
            transform: getStaggeredAnimationStyle(animationInfo, 0, 3).transform,
            opacity: getStaggeredAnimationStyle(animationInfo, 0, 3).opacity,
            transition: getLayoutTransition(!!animationInfo),
          }}
        >
          <MediaContainer
            index={0}
            media={mediaAssets[0]}
            cornerRadius={effectiveCornerRadius}
            isPreview={isPreview}
            onScreenClick={onScreenClick}
            styleCSS={styleCSS}
            playing={playing}
          />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          {[1, 2].map((index) => {
            const animStyle = getStaggeredAnimationStyle(animationInfo, index, 3);
            return (
              <div
                key={index}
                className="flex-1"
                style={{
                  transform: animStyle.transform,
                  opacity: animStyle.opacity,
                  transition: getLayoutTransition(!!animationInfo),
                }}
              >
                <MediaContainer
                  index={index}
                  media={mediaAssets[index]}
                  cornerRadius={effectiveCornerRadius}
                  isPreview={isPreview}
                  onScreenClick={onScreenClick}
                  styleCSS={styleCSS}
                  playing={playing}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Asymmetric layout (uneven grid)
export const AsymmetricLayout = ({
  containerRef,
  containerStyle,
  mediaAssets,
  effectiveCornerRadius,
  styleCSS,
  isPreview,
  onScreenClick,
  playing,
  animationInfo,
  sizePercent,
}: LayoutBaseProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 overflow-hidden">
      <div
        ref={containerRef}
        className="relative grid gap-2 transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          width: '90%',
          height: '85%',
          maxWidth: sizePercent,
          maxHeight: sizePercent,
          gridTemplateColumns: '2fr 1fr',
          gridTemplateRows: '1fr 1fr',
        }}
      >
        <div
          className="row-span-2"
          style={{
            transform: getStaggeredAnimationStyle(animationInfo, 0, 4).transform,
            opacity: getStaggeredAnimationStyle(animationInfo, 0, 4).opacity,
            transition: getLayoutTransition(!!animationInfo),
          }}
        >
          <MediaContainer
            index={0}
            media={mediaAssets[0]}
            cornerRadius={effectiveCornerRadius}
            isPreview={isPreview}
            onScreenClick={onScreenClick}
            styleCSS={styleCSS}
            playing={playing}
          />
        </div>
        {[1, 2].map((index) => {
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 4);
          return (
            <div
              key={index}
              style={{
                transform: animStyle.transform,
                opacity: animStyle.opacity,
                transition: getLayoutTransition(!!animationInfo),
              }}
            >
              <MediaContainer
                index={index}
                media={mediaAssets[index]}
                cornerRadius={effectiveCornerRadius}
                isPreview={isPreview}
                onScreenClick={onScreenClick}
                styleCSS={styleCSS}
                playing={playing}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
