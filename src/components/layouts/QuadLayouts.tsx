import { MediaContainer } from '../MediaContainer';
import { getStaggeredAnimationStyle, getLayoutTransition } from '../../utils/animationHelpers';
import { type LayoutBaseProps } from './types';

// Grid layout (2x2)
export const GridLayout = ({
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
  hasMockup,
}: LayoutBaseProps) => {
  return (
    <div className={`flex h-full w-full items-center justify-center p-2 ${hasMockup ? '' : 'overflow-hidden'}`}>
      <div
        ref={containerRef}
        className="relative grid grid-cols-2 gap-2 transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          width: isPreview ? '100%' : sizePercent,
          height: isPreview ? '100%' : sizePercent,
          maxWidth: sizePercent,
          maxHeight: sizePercent,
        }}
      >
        {[0, 1, 2, 3].map((index) => {
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 4);
          return (
            <div
              key={index}
              className="min-w-0 min-h-0 overflow-hidden"
              style={{
                aspectRatio: aspectValue ? aspectValue : 1,
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

// Overlap layout (stacked cards with offset)
export const OverlapLayout = ({
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
  renderWithMockup,
  sizePercent,
  hasMockup,
}: LayoutBaseProps) => {
  const offsets = [
    { x: 0, y: 0, rotate: -8, zIndex: 40 },
    { x: 15, y: 10, rotate: -2, zIndex: 30 },
    { x: 30, y: 20, rotate: 4, zIndex: 20 },
    { x: 45, y: 30, rotate: 10, zIndex: 10 },
  ];

  return (
    <div className={`flex h-full w-full items-center justify-center ${hasMockup ? '' : 'overflow-hidden'}`}>
      <div
        ref={containerRef}
        className="relative transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          width: isPreview ? '100%' : '70%',
          height: isPreview ? '100%' : '70%',
          maxWidth: sizePercent,
          maxHeight: sizePercent,
        }}
      >
        {[0, 1, 2, 3].map((index) => {
          const offset = offsets[index];
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 4);
          return (
            <div
              key={index}
              className="absolute"
              style={{
                width: '60%',
                aspectRatio: aspectValue ? aspectValue : 3 / 4,
                left: `${offset.x}%`,
                top: `${offset.y}%`,
                zIndex: offset.zIndex,
                transform: `rotate(${offset.rotate}deg) ${animStyle.transform}`,
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

// Creative layout (scattered/collage style)
export const CreativeLayout = ({
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
  hasMockup,
}: LayoutBaseProps) => {
  const positions = [
    { left: '0%', top: '0%', width: '60%', height: '60%', zIndex: 10 },
    { right: '0%', bottom: '0%', width: '55%', height: '55%', zIndex: 20 },
    { right: '5%', top: '10%', width: '35%', height: '35%', zIndex: 30 },
    { left: '5%', bottom: '5%', width: '40%', height: '40%', zIndex: 40 },
  ];

  return (
    <div className={`flex h-full w-full items-center justify-center p-4 ${hasMockup ? '' : 'overflow-hidden'}`}>
      <div
        ref={containerRef}
        className="relative w-full h-full transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          maxWidth: sizePercent,
          maxHeight: sizePercent,
        }}
      >
        {[0, 1, 2, 3].map((index) => {
          const pos = positions[index];
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 4);
          return (
            <div
              key={index}
              className="absolute"
              style={{
                ...pos,
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

// Cross layout (4 images in cross pattern)
export const CrossLayout = ({
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
  hasMockup,
}: LayoutBaseProps) => {
  const crossPositions = [
    { gridArea: '1 / 2' },
    { gridArea: '2 / 1' },
    { gridArea: '2 / 3' },
    { gridArea: '3 / 2' },
  ];

  return (
    <div className={`flex h-full w-full items-center justify-center p-4 ${hasMockup ? '' : 'overflow-hidden'}`}>
      <div
        ref={containerRef}
        className="relative grid grid-cols-3 grid-rows-3 gap-2 transition-transform duration-300 ease-out overflow-hidden"
        style={{
          ...containerStyle,
          width: '90%',
          height: '90%',
          maxWidth: sizePercent,
          maxHeight: sizePercent,
        }}
      >
        {[0, 1, 2, 3].map((index) => {
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 4);
          return (
            <div
              key={index}
              className=""
              style={{
                gridArea: crossPositions[index].gridArea,
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

// Magazine layout (editorial style)
export const MagazineLayout = ({
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
  hasMockup,
}: LayoutBaseProps) => {
  return (
    <div className={`flex h-full w-full items-center justify-center p-4 ${hasMockup ? '' : 'overflow-hidden'}`}>
      <div
        ref={containerRef}
        className="relative grid grid-cols-3 grid-rows-2 gap-2 transition-transform duration-300 ease-out overflow-hidden"
        style={{
          ...containerStyle,
          width: '95%',
          height: '85%',
          maxWidth: sizePercent,
          maxHeight: sizePercent,
        }}
      >
        {[0, 1, 2, 3].map((index) => {
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 4);
          const isHero = index === 0;
          return (
            <div
              key={index}
              className={isHero ? 'col-span-2 row-span-2' : ''}
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

// Showcase layout (1 hero + 3 thumbnails)
export const ShowcaseLayout = ({
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
  hasMockup,
}: LayoutBaseProps) => {
  return (
    <div className={`flex h-full w-full items-center justify-center p-4 ${hasMockup ? '' : 'overflow-hidden'}`}>
      <div
        ref={containerRef}
        className="relative flex flex-col gap-3 transition-transform duration-300 ease-out overflow-hidden"
        style={{
          ...containerStyle,
          width: '90%',
          height: '90%',
          maxWidth: sizePercent,
          maxHeight: sizePercent,
        }}
      >
        <div
          className="flex-2"
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
        <div className="flex-1 flex gap-3">
          {[1, 2, 3].map((index) => {
            const animStyle = getStaggeredAnimationStyle(animationInfo, index, 4);
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

// Scattered layout (random-looking placement)
export const ScatteredLayout = ({
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
  hasMockup,
}: LayoutBaseProps) => {
  const scatteredPositions = [
    { left: '5%', top: '5%', width: '45%', rotation: -5, zIndex: 10 },
    { right: '5%', top: '15%', width: '40%', rotation: 8, zIndex: 20 },
    { left: '15%', bottom: '10%', width: '42%', rotation: -3, zIndex: 30 },
    { right: '10%', bottom: '5%', width: '38%', rotation: 6, zIndex: 40 },
  ];

  return (
    <div className={`flex h-full w-full items-center justify-center p-4 ${hasMockup ? '' : 'overflow-hidden'}`}>
      <div
        ref={containerRef}
        className="relative w-full h-full transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          maxWidth: sizePercent,
          maxHeight: sizePercent,
        }}
      >
        {[0, 1, 2, 3].map((index) => {
          const { rotation, ...pos } = scatteredPositions[index];
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 4);
          return (
            <div
              key={index}
              className="absolute"
              style={{
                ...pos,
                aspectRatio: aspectValue || 4 / 3,
                transform: `rotate(${rotation}deg) ${animStyle.transform}`,
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

// Cascade layout (staircase effect)
export const CascadeLayout = ({
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
  hasMockup,
}: LayoutBaseProps) => {
  return (
    <div className={`flex h-full w-full items-center justify-center ${hasMockup ? '' : 'overflow-hidden'}`}>
      <div
        ref={containerRef}
        className="relative transition-transform duration-300 ease-out"
        style={{
          ...containerStyle,
          width: '85%',
          height: '85%',
          maxWidth: sizePercent,
          maxHeight: sizePercent,
        }}
      >
        {[0, 1, 2, 3].map((index) => {
          const animStyle = getStaggeredAnimationStyle(animationInfo, index, 4);
          return (
            <div
              key={index}
              className="absolute"
              style={{
                width: '50%',
                aspectRatio: aspectValue || 3 / 4,
                left: `${index * 15}%`,
                top: `${index * 12}%`,
                zIndex: 40 - index * 10,
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

// Brick layout (offset grid like bricks)
export const BrickLayout = ({
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
  hasMockup,
}: LayoutBaseProps) => {
  return (
    <div className={`flex h-full w-full items-center justify-center p-4 ${hasMockup ? '' : 'overflow-hidden'}`}>
      <div
        ref={containerRef}
        className="relative flex flex-col gap-2 transition-transform duration-300 ease-out overflow-hidden"
        style={{
          ...containerStyle,
          width: '90%',
          height: '85%',
          maxWidth: sizePercent,
          maxHeight: sizePercent,
        }}
      >
        <div className="flex-1 flex gap-2">
          {[0, 1].map((index) => {
            const animStyle = getStaggeredAnimationStyle(animationInfo, index, 4);
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
        <div className="flex-1 flex gap-2 -mx-[15%]">
          {[2, 3].map((index) => {
            const animStyle = getStaggeredAnimationStyle(animationInfo, index, 4);
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
    </div>
  );
};
