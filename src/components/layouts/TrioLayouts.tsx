import { MediaContainer } from '../MediaContainer';
import { getStaggeredAnimationStyle, getLayoutTransition } from '../../utils/animationHelpers';
import type { LayoutBaseProps } from './types';

// Trio row layout (3 images horizontal)
export const TrioRowLayout = ({
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
}: LayoutBaseProps) => (
  <div className="flex h-full w-full items-center justify-center">
    <div
      ref={containerRef}
      className="relative flex gap-3 transition-[transform,box-shadow] duration-300 ease-out"
      style={{
        ...containerStyle,
        width: isPreview ? '100%' : '95%',
        height: aspectValue ? undefined : isPreview ? '100%' : '60%',
        maxHeight: isPreview ? '100%' : '75%',
      }}
    >
      {[0, 1, 2].map((index) => {
        const animStyle = getStaggeredAnimationStyle(animationInfo, index, 3);
        return (
          <div
            key={index}
            className="flex-1 overflow-hidden"
            style={{
              aspectRatio: aspectValue ? aspectValue : undefined,
              borderRadius: `${effectiveCornerRadius}px`,
              filter: shadowFilter,
              transform: animStyle.transform,
              opacity: animStyle.opacity,
              transition: getLayoutTransition(!!animationInfo),
              willChange: 'transform, opacity',
              ...styleCSS,
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

// Trio column layout (3 images vertical)
export const TrioColumnLayout = ({
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
}: LayoutBaseProps) => (
  <div className="flex h-full w-full items-center justify-center">
    <div
      ref={containerRef}
      className="relative flex flex-col gap-3 transition-[transform,box-shadow] duration-300 ease-out"
      style={{
        ...containerStyle,
        width: aspectValue ? undefined : isPreview ? '100%' : '55%',
        height: isPreview ? '100%' : '95%',
        maxWidth: isPreview ? '100%' : '70%',
      }}
    >
      {[0, 1, 2].map((index) => {
        const animStyle = getStaggeredAnimationStyle(animationInfo, index, 3);
        return (
          <div
            key={index}
            className="flex-1 overflow-hidden"
            style={{
              aspectRatio: aspectValue ? aspectValue : undefined,
              borderRadius: `${effectiveCornerRadius}px`,
              filter: shadowFilter,
              transform: animStyle.transform,
              opacity: animStyle.opacity,
              transition: getLayoutTransition(!!animationInfo),
              willChange: 'transform, opacity',
              ...styleCSS,
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

// Fan/Triptych layout (3 equal panels)
export const FanLayout = ({
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
  renderWithMockup,
}: LayoutBaseProps) => (
  <div className="flex h-full w-full items-center justify-center p-4">
    <div
      ref={containerRef}
      className="relative flex gap-2 transition-[transform,box-shadow] duration-300 ease-out"
      style={{ ...containerStyle, width: '95%', height: '75%' }}
    >
      {[0, 1, 2].map((index) => {
        const animStyle = getStaggeredAnimationStyle(animationInfo, index, 3);
        return (
          <div
            key={index}
            className="flex-1 overflow-hidden"
            style={{
              borderRadius: `${effectiveCornerRadius}px`,
              filter: shadowFilter,
              transform: animStyle.transform,
              opacity: animStyle.opacity,
              transition: getLayoutTransition(!!animationInfo),
              ...styleCSS,
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

// Masonry layout
export const MasonryLayout = ({
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
}: LayoutBaseProps) => (
  <div className="flex h-full w-full items-center justify-center p-4">
    <div
      ref={containerRef}
      className="relative grid grid-cols-2 gap-2 transition-[transform,box-shadow] duration-300 ease-out"
      style={{
        ...containerStyle,
        width: isPreview ? '100%' : '85%',
        height: isPreview ? '100%' : '85%',
        gridTemplateRows: '1.5fr 1fr',
      }}
    >
      <div
        className="relative row-span-2 overflow-hidden rounded-[inherit]"
        style={{ borderRadius: `${effectiveCornerRadius}px`, filter: shadowFilter, ...styleCSS }}
      >
        <div
          className="w-full h-full"
          style={{
            transform: getStaggeredAnimationStyle(animationInfo, 0, 4).transform,
            opacity: getStaggeredAnimationStyle(animationInfo, 0, 4).opacity,
            transition: getLayoutTransition(!!animationInfo),
            ...styleCSS,
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
      </div>
      <div
        className="relative overflow-hidden rounded-[inherit]"
        style={{ borderRadius: `${effectiveCornerRadius}px`, filter: shadowFilter, ...styleCSS }}
      >
        <div
          className="w-full h-full"
          style={{
            transform: getStaggeredAnimationStyle(animationInfo, 1, 4).transform,
            opacity: getStaggeredAnimationStyle(animationInfo, 1, 4).opacity,
            transition: getLayoutTransition(!!animationInfo),
            ...styleCSS,
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
      </div>
      <div
        className="relative overflow-hidden rounded-[inherit]"
        style={{ borderRadius: `${effectiveCornerRadius}px`, filter: shadowFilter, ...styleCSS }}
      >
        <div
          className="w-full h-full"
          style={{
            transform: getStaggeredAnimationStyle(animationInfo, 2, 4).transform,
            opacity: getStaggeredAnimationStyle(animationInfo, 2, 4).opacity,
            transition: getLayoutTransition(!!animationInfo),
            ...styleCSS,
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
  </div>
);

// Mosaic layout (complex grid)
export const MosaicLayout = ({
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
  renderWithMockup,
}: LayoutBaseProps) => (
  <div className="flex h-full w-full items-center justify-center p-4">
    <div
      ref={containerRef}
      className="relative grid grid-cols-2 grid-rows-2 gap-3 transition-[transform,box-shadow] duration-300 ease-out"
      style={{
        ...containerStyle,
        width: isPreview ? '100%' : '90%',
        height: isPreview ? '100%' : '80%',
      }}
    >
      {[0, 1, 2].map((index) => {
        const isHero = index === 0;
        const animStyle = getStaggeredAnimationStyle(animationInfo, index, 3);
        return (
          <div
            key={index}
            className={`relative overflow-hidden ${isHero ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1'}`}
            style={{
              borderRadius: `${effectiveCornerRadius}px`,
              filter: shadowFilter,
              transform: animStyle.transform,
              opacity: animStyle.opacity,
              transition: getLayoutTransition(!!animationInfo),
              willChange: 'transform, opacity',
              ...styleCSS,
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

// Film Strip layout
export const FilmStripLayout = ({
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
}: LayoutBaseProps & { cornerRadius: number }) => (
  <div className="flex h-full w-full items-center justify-center overflow-hidden">
    <div
      ref={containerRef}
      className="relative flex flex-col gap-4 transition-[transform,box-shadow] duration-300 ease-out"
      style={{
        ...containerStyle,
        width: isPreview ? '100%' : '60%',
        height: isPreview ? '100%' : '90%',
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
              filter: shadowFilter,
              transform: `skewY(-5deg) ${animStyle.transform === 'none' ? '' : animStyle.transform}`,
              opacity: animStyle.opacity,
              transition: getLayoutTransition(!!animationInfo),
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              willChange: 'transform, opacity',
              ...styleCSS,
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

// Spotlight layout (1 large + 2 small)
export const SpotlightLayout = ({
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
}: LayoutBaseProps) => (
  <div className="flex h-full w-full items-center justify-center p-4">
    <div
      ref={containerRef}
      className="relative flex gap-3 transition-[transform,box-shadow] duration-300 ease-out"
      style={{ ...containerStyle, width: '95%', height: '85%' }}
    >
      <div
        className="flex-[2] overflow-hidden"
        style={{
          borderRadius: `${effectiveCornerRadius}px`,
          filter: shadowFilter,
          transform: getStaggeredAnimationStyle(animationInfo, 0, 3).transform,
          opacity: getStaggeredAnimationStyle(animationInfo, 0, 3).opacity,
          transition: getLayoutTransition(!!animationInfo),
          ...styleCSS,
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
              className="flex-1 overflow-hidden"
              style={{
                borderRadius: `${effectiveCornerRadius}px`,
                filter: shadowFilter,
                transform: animStyle.transform,
                opacity: animStyle.opacity,
                transition: getLayoutTransition(!!animationInfo),
                ...styleCSS,
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

// Asymmetric layout (uneven grid)
export const AsymmetricLayout = ({
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
}: LayoutBaseProps) => (
  <div className="flex h-full w-full items-center justify-center p-4">
    <div
      ref={containerRef}
      className="relative grid gap-2 transition-[transform,box-shadow] duration-300 ease-out"
      style={{
        ...containerStyle,
        width: '90%',
        height: '85%',
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: '1fr 1fr',
      }}
    >
      <div
        className="row-span-2 overflow-hidden"
        style={{
          borderRadius: `${effectiveCornerRadius}px`,
          filter: shadowFilter,
          transform: getStaggeredAnimationStyle(animationInfo, 0, 4).transform,
          opacity: getStaggeredAnimationStyle(animationInfo, 0, 4).opacity,
          transition: getLayoutTransition(!!animationInfo),
          ...styleCSS,
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
            className="overflow-hidden"
            style={{
              borderRadius: `${effectiveCornerRadius}px`,
              filter: shadowFilter,
              transform: animStyle.transform,
              opacity: animStyle.opacity,
              transition: getLayoutTransition(!!animationInfo),
              ...styleCSS,
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
