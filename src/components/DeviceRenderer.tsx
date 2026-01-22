import { useRef, useMemo, memo, useCallback, useEffect } from 'react';
import { ImagePlus } from 'lucide-react';
import { STYLE_PRESETS } from '../constants/styles';
import type { MediaAsset } from '../store/renderStore';
import { combineAnimations, CSS_TRANSITIONS } from '../constants/animations';

export type AspectRatio = 'free' | '1:1' | '4:5' | '9:16' | '16:9' | '3:4' | '4:3';

type AnimationInfo = {
  animations: { type: string; intensity?: number }[];
  progress: number;
  easing: string;
  stagger?: number; // Stagger delay in ms as ratio of total duration
  totalDuration?: number;
};

type ImageRendererProps = {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  cornerRadius: number;
  mediaAssets: (MediaAsset | null)[];
  aspectRatio?: AspectRatio;
  scale?: number;
  isPreview?: boolean;
  onScreenClick?: (index: number) => void;
  stylePreset?: string;
  shadowType?: string;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowBlur?: number;
  shadowX?: number;
  shadowY?: number;
  layout?: 'single' | 'side-by-side' | 'stacked' | 'trio-row' | 'trio-column' | 'grid' | 'overlap' | 'fan' | 'creative';
  animationInfo?: AnimationInfo;
  playing?: boolean;
};

// =============================================================================
// MediaContainer - Extracted and memoized for performance
// =============================================================================
type MediaContainerProps = {
  index: number;
  media: MediaAsset | null;
  cornerRadius: number;
  isPreview: boolean;
  onScreenClick?: (index: number) => void;
  styleCSS: React.CSSProperties;
  playing?: boolean;
};

const MediaContainer = memo(({
  index,
  media,
  cornerRadius,
  isPreview,
  onScreenClick,
  styleCSS,
  playing = true,
}: MediaContainerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [playing]);

  const handleClick = useCallback(() => {
    if (!isPreview) onScreenClick?.(index);
  }, [isPreview, onScreenClick, index]);

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${isPreview ? '' : 'cursor-pointer group'}`}
      onClick={handleClick}
      style={{
        borderRadius: 'inherit',
        // Removing transition here to ensure it updates instantly with parent
      }}
    >
      {media ? (
        media.type === 'video' ? (
          <video
            ref={videoRef}
            src={media.url}
            className="w-full h-full object-cover block"
            style={{
              borderRadius: 'inherit',
            }}
            autoPlay={playing}
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={media.url}
            className="w-full h-full object-cover block"
            style={{
              borderRadius: 'inherit',
            }}
            alt="Media"
            loading="eager"
            decoding="sync"
          />
        )
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center ${isPreview ? 'p-1' : 'p-8'} ${!isPreview && 'group-hover:brightness-110'}`}
          style={{
            borderRadius: 'inherit',
            background: styleCSS.background || 'rgba(24, 24, 27, 0.8)',
            border: styleCSS.border || '2px dashed rgba(255, 255, 255, 0.2)',
            boxShadow: styleCSS.boxShadow,
            backdropFilter: styleCSS.backdropFilter,
            transition: 'background 0.3s ease, border 0.3s ease',
          }}
        >
          <div className={`flex flex-col items-center gap-4 text-ui-text ${!isPreview && 'group-hover:text-accent group-hover:scale-110'}`} style={{ transition: 'color 0.3s ease, transform 0.3s ease' }}>
            <ImagePlus className={isPreview ? 'w-5 h-5' : 'w-16 h-16'} />
            {!isPreview && <span className="text-sm uppercase tracking-widest text-center font-bold">Add Image</span>}
          </div>
        </div>
      )}
      {/* Hover overlay */}
      {media && !isPreview && (
        <div
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none"
          style={{
            borderRadius: 'inherit',
            transition: 'opacity 0.3s ease',
          }}
        >
          <span className="text-[11px] text-white font-medium uppercase tracking-wider">Change</span>
        </div>
      )}
    </div>
  );
});

const getAspectRatioValue = (ratio: AspectRatio): number | null => {
  switch (ratio) {
    case '1:1': return 1;
    case '4:5': return 4 / 5;
    case '9:16': return 9 / 16;
    case '16:9': return 16 / 9;
    case '3:4': return 3 / 4;
    case '4:3': return 4 / 3;
    default: return null;
  }
};

// Calculate staggered animation style for each image
const getStaggeredAnimationStyle = (
  animationInfo: AnimationInfo | undefined,
  imageIndex: number,
  totalImages: number
): { transform: string; opacity: number } => {
  if (!animationInfo || animationInfo.animations.length === 0) {
    return { transform: 'none', opacity: 1 };
  }

  const { animations, progress, easing, stagger = 0.15 } = animationInfo;

  // Calculate delayed progress for this image
  // Each subsequent image starts later based on stagger
  const staggerDelay = imageIndex * stagger;
  const adjustedProgress = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - stagger * (totalImages - 1))));

  // If this image hasn't started animating yet
  if (adjustedProgress <= 0) {
    // Return initial state based on animation type
    const firstAnim = animations[0]?.type;
    if (firstAnim?.includes('slide') || firstAnim?.includes('zoom-up') || firstAnim?.includes('zoom-down') ||
        firstAnim === 'spiral' || firstAnim === 'fan' || firstAnim === 'domino' || 
        firstAnim === 'converge' || firstAnim === 'diverge' || firstAnim === 'elevator' || firstAnim === 'skew-slide') {
      return { transform: 'scale(0)', opacity: 0 };
    }
    return { transform: 'none', opacity: 1 };
  }

  const result = combineAnimations(animations, adjustedProgress, easing);
  return {
    transform: result.transform,
    opacity: result.opacity ?? 1,
  };
};

const DeviceRendererComponent = ({
  rotationX,
  rotationY,
  rotationZ,
  cornerRadius,
  mediaAssets,
  aspectRatio = 'free',
  isPreview = false,
  onScreenClick,
  scale = 1,
  stylePreset = 'default',
  shadowType = 'spread',
  shadowOpacity = 40,
  shadowColor = '#000000',
  shadowBlur = 30,
  shadowX = 0,
  shadowY = 20,
  layout = 'single',
  animationInfo,
  playing = true,
}: ImageRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoized style preset CSS
  const styleCSS = useMemo(() => {
    const preset = STYLE_PRESETS.find(p => p.id === stylePreset);
    if (!preset || stylePreset === 'default') return {};
    return preset.css;
  }, [stylePreset]);

  // Memoized computed shadow - drop-shadow filter (works better with 3D transforms)
  const shadowFilter = useMemo(() => {
    if (isPreview || shadowType === 'none') {
      return 'none';
    }

    const hex = shadowColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const alpha = (shadowOpacity / 100);
    const rgba = `rgba(${r}, ${g}, ${b}, ${alpha})`;

    // drop-shadow(x-offset y-offset blur-radius color)
    return `drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px ${rgba})`;
  }, [isPreview, shadowType, shadowColor, shadowOpacity, shadowBlur, shadowX, shadowY]);

  const aspectValue = getAspectRatioValue(aspectRatio);

  const containerStyle = {
    transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ || 0}deg) scale(${scale})`,
    transformStyle: 'preserve-3d' as const,
  };

  // Single image layout
  if (layout === 'single') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={containerRef}
          className="relative overflow-hidden transition-[transform,border-radius,box-shadow] duration-300 ease-out"
          style={{
            ...containerStyle,
            width: aspectValue ? 'auto' : '85%',
            height: aspectValue ? '85%' : '85%',
            aspectRatio: aspectValue ? aspectValue : undefined,
            maxWidth: '85%',
            maxHeight: '85%',
            borderRadius: `${cornerRadius}px`,
            filter: shadowFilter,
            backfaceVisibility: 'hidden',
            ...styleCSS
          }}
        >
          <MediaContainer index={0} media={mediaAssets[0]} cornerRadius={cornerRadius} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
        </div>
      </div>
    );
  }

  // Side by side layout (2 images)
  if (layout === 'side-by-side') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={containerRef}
          className="relative flex gap-4 transition-[transform,box-shadow] duration-300 ease-out"
          style={{
            ...containerStyle,
            width: '90%',
            height: aspectValue ? undefined : '75%',
            maxHeight: '85%',
          }}
        >
          {[0, 1].map((index) => {
            const animStyle = getStaggeredAnimationStyle(animationInfo, index, 2);
            return (
              <div
                key={index}
                className="flex-1 overflow-hidden"
                style={{
                  aspectRatio: aspectValue ? aspectValue : undefined,
                  borderRadius: `${cornerRadius}px`,
                  filter: shadowFilter,
                  transform: animStyle.transform,
                  opacity: animStyle.opacity,
                  transition: animationInfo ? 'none' : CSS_TRANSITIONS.stagger,
                  willChange: 'transform, opacity',
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} media={mediaAssets[index]} cornerRadius={cornerRadius} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Stacked layout (2 images)
  if (layout === 'stacked') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={containerRef}
          className="relative flex flex-col gap-4 transition-[transform,box-shadow] duration-300 ease-out"
          style={{
            ...containerStyle,
            width: aspectValue ? undefined : '70%',
            height: '90%',
            maxWidth: '85%',
          }}
        >
          {[0, 1].map((index) => {
            const animStyle = getStaggeredAnimationStyle(animationInfo, index, 2);
            return (
              <div
                key={index}
                className="flex-1 overflow-hidden"
                style={{
                  aspectRatio: aspectValue ? aspectValue : undefined,
                  borderRadius: `${cornerRadius}px`,
                  filter: shadowFilter,
                  transform: animStyle.transform,
                  opacity: animStyle.opacity,
                  transition: animationInfo ? 'none' : CSS_TRANSITIONS.stagger,
                  willChange: 'transform, opacity',
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} media={mediaAssets[index]} cornerRadius={cornerRadius} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Trio row layout (3 images horizontal)
  if (layout === 'trio-row') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={containerRef}
          className="relative flex gap-3 transition-[transform,box-shadow] duration-300 ease-out"
          style={{
            ...containerStyle,
            width: '95%',
            height: aspectValue ? undefined : '60%',
            maxHeight: '75%',
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
                  borderRadius: `${cornerRadius}px`,
                  filter: shadowFilter,
                  transform: animStyle.transform,
                  opacity: animStyle.opacity,
                  transition: animationInfo ? 'none' : CSS_TRANSITIONS.stagger,
                  willChange: 'transform, opacity',
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} media={mediaAssets[index]} cornerRadius={cornerRadius} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Trio column layout (3 images vertical)
  if (layout === 'trio-column') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={containerRef}
          className="relative flex flex-col gap-3 transition-[transform,box-shadow] duration-300 ease-out"
          style={{
            ...containerStyle,
            width: aspectValue ? undefined : '55%',
            height: '95%',
            maxWidth: '70%',
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
                  borderRadius: `${cornerRadius}px`,
                  filter: shadowFilter,
                  transform: animStyle.transform,
                  opacity: animStyle.opacity,
                  transition: animationInfo ? 'none' : CSS_TRANSITIONS.stagger,
                  willChange: 'transform, opacity',
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} media={mediaAssets[index]} cornerRadius={cornerRadius} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Grid layout (2x2)
  if (layout === 'grid') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={containerRef}
          className="relative grid grid-cols-2 gap-3 transition-[transform,box-shadow] duration-300 ease-out"
          style={{
            ...containerStyle,
            width: '85%',
            height: '85%',
            maxWidth: '85%',
            maxHeight: '85%',
          }}
        >
          {[0, 1, 2, 3].map((index) => {
            const animStyle = getStaggeredAnimationStyle(animationInfo, index, 4);
            return (
              <div
                key={index}
                className="overflow-hidden"
                style={{
                  aspectRatio: aspectValue ? aspectValue : 1,
                  borderRadius: `${cornerRadius}px`,
                  filter: shadowFilter,
                  transform: animStyle.transform,
                  opacity: animStyle.opacity,
                  transition: animationInfo ? 'none' : CSS_TRANSITIONS.stagger,
                  willChange: 'transform, opacity',
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} media={mediaAssets[index]} cornerRadius={cornerRadius} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Overlap layout (stacked cards with offset)
  if (layout === 'overlap') {
    const offsets = [
      { x: 0, y: 0, rotate: -8, zIndex: 40 },
      { x: 15, y: 10, rotate: -2, zIndex: 30 },
      { x: 30, y: 20, rotate: 4, zIndex: 20 },
      { x: 45, y: 30, rotate: 10, zIndex: 10 },
    ];
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={containerRef}
          className="relative transition-[transform,box-shadow] duration-300 ease-out"
          style={{
            ...containerStyle,
            width: '70%',
            height: '70%',
          }}
        >
          {[0, 1, 2, 3].map((index) => {
            const offset = offsets[index];
            const animStyle = getStaggeredAnimationStyle(animationInfo, index, 4);
            return (
              <div
                key={index}
                className="absolute overflow-hidden"
                style={{
                  width: '60%',
                  aspectRatio: aspectValue ? aspectValue : 3/4,
                  left: `${offset.x}%`,
                  top: `${offset.y}%`,
                  zIndex: offset.zIndex,
                  borderRadius: `${cornerRadius}px`,
                  filter: shadowFilter,
                  transform: `rotate(${offset.rotate}deg) ${animStyle.transform}`,
                  opacity: animStyle.opacity,
                  transition: animationInfo ? 'none' : CSS_TRANSITIONS.stagger,
                  willChange: 'transform, opacity',
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} media={mediaAssets[index]} cornerRadius={cornerRadius} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Creative layout (scattered/collage style)
  if (layout === 'creative') {
    const positions = [
      { left: '0%', top: '0%', width: '60%', height: '60%', zIndex: 10 },
      { right: '0%', bottom: '0%', width: '55%', height: '55%', zIndex: 20 },
      { right: '5%', top: '10%', width: '35%', height: '35%', zIndex: 30 },
      { left: '5%', bottom: '5%', width: '40%', height: '40%', zIndex: 40 },
    ];
    
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <div
          ref={containerRef}
          className="relative w-full h-full transition-[transform,box-shadow] duration-300 ease-out"
          style={containerStyle}
        >
          {[0, 1, 2, 3].map((index) => {
            const pos = positions[index];
            const animStyle = getStaggeredAnimationStyle(animationInfo, index, 4);
            return (
              <div
                key={index}
                className="absolute overflow-hidden"
                style={{
                  ...pos,
                  aspectRatio: aspectValue ? aspectValue : undefined, // Keep free aspect ratio if set on container or square
                  borderRadius: `${cornerRadius}px`,
                  filter: shadowFilter,
                  transform: animStyle.transform,
                  opacity: animStyle.opacity,
                  transition: animationInfo ? 'none' : CSS_TRANSITIONS.stagger,
                  willChange: 'transform, opacity',
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} media={mediaAssets[index]} cornerRadius={cornerRadius} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Masonry layout
  if (layout === 'masonry') {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <div
          ref={containerRef}
          className="relative grid grid-cols-2 gap-3 transition-[transform,box-shadow] duration-300 ease-out"
          style={{
            ...containerStyle,
            width: '85%',
            height: '85%', 
            gridTemplateRows: '1.5fr 1fr',
          }}
        >
          <div className="relative row-span-2 overflow-hidden rounded-[inherit]" style={{ borderRadius: `${cornerRadius}px`, filter: shadowFilter, ...styleCSS }}>
             <div className="w-full h-full" style={{ transform: getStaggeredAnimationStyle(animationInfo, 0, 4).transform, opacity: getStaggeredAnimationStyle(animationInfo, 0, 4).opacity, transition: animationInfo ? 'none' : CSS_TRANSITIONS.stagger, ...styleCSS }}>
                <MediaContainer index={0} media={mediaAssets[0]} cornerRadius={cornerRadius} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
             </div>
          </div>
          <div className="relative overflow-hidden rounded-[inherit]" style={{ borderRadius: `${cornerRadius}px`, filter: shadowFilter, ...styleCSS }}>
             <div className="w-full h-full" style={{ transform: getStaggeredAnimationStyle(animationInfo, 1, 4).transform, opacity: getStaggeredAnimationStyle(animationInfo, 1, 4).opacity, transition: animationInfo ? 'none' : CSS_TRANSITIONS.stagger, ...styleCSS }}>
                <MediaContainer index={1} media={mediaAssets[1]} cornerRadius={cornerRadius} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
             </div>
          </div>
          <div className="relative overflow-hidden rounded-[inherit]" style={{ borderRadius: `${cornerRadius}px`, filter: shadowFilter, ...styleCSS }}>
             <div className="w-full h-full" style={{ transform: getStaggeredAnimationStyle(animationInfo, 2, 4).transform, opacity: getStaggeredAnimationStyle(animationInfo, 2, 4).opacity, transition: animationInfo ? 'none' : CSS_TRANSITIONS.stagger, ...styleCSS }}>
                <MediaContainer index={2} media={mediaAssets[2]} cornerRadius={cornerRadius} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Mosaic layout (complex grid)
  if (layout === 'mosaic') {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <div
          ref={containerRef}
          className="relative grid grid-cols-2 grid-rows-2 gap-3 transition-[transform,box-shadow] duration-300 ease-out"
          style={{
            ...containerStyle,
            width: '90%',
            height: '80%',
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
                  borderRadius: `${cornerRadius}px`, 
                  filter: shadowFilter,
                  transform: animStyle.transform,
                  opacity: animStyle.opacity,
                  transition: animationInfo ? 'none' : CSS_TRANSITIONS.stagger,
                  willChange: 'transform, opacity',
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} media={mediaAssets[index]} cornerRadius={cornerRadius} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
              </div>
             );
          })}
        </div>
      </div>
    );
  }

  // Film Strip layout
  if (layout === 'film-strip') {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-hidden">
        <div
          ref={containerRef}
          className="relative flex flex-col gap-4 transition-[transform,box-shadow] duration-300 ease-out"
          style={{
             ...containerStyle,
             width: '60%',
             height: '90%',
          }}
        >
           {[0, 1, 2].map((index) => {
             const animStyle = getStaggeredAnimationStyle(animationInfo, index, 3);
             return (
               <div
                  key={index}
                  className="flex-1 overflow-hidden relative"
                  style={{
                    borderRadius: `${cornerRadius}px`, 
                    filter: shadowFilter,
                    transform: `skewY(-5deg) ${animStyle.transform === 'none' ? '' : animStyle.transform}`,
                    opacity: animStyle.opacity,
                    transition: animationInfo ? 'none' : CSS_TRANSITIONS.stagger,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    willChange: 'transform, opacity',
                    ...styleCSS
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
                     <MediaContainer index={index} media={mediaAssets[index]} cornerRadius={Math.max(2, cornerRadius - 4)} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
                   </div>
               </div>
             );
           })}
        </div>
      </div>
    );
  }

  // Fan layout (radial spread)
  if (layout === 'fan') {
    const fanAngles = [-25, 0, 25];
    const fanOffsets = [
      { x: -15, y: 10 },
      { x: 0, y: 0 },
      { x: 15, y: 10 },
    ];
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={containerRef}
          className="relative transition-[transform,box-shadow] duration-300 ease-out"
          style={{
            ...containerStyle,
            width: '80%',
            height: '80%',
          }}
        >
          {[0, 1, 2].map((index) => {
            const angle = fanAngles[index];
            const offset = fanOffsets[index];
            const animStyle = getStaggeredAnimationStyle(animationInfo, index, 3);
            return (
              <div
                key={index}
                className="absolute overflow-hidden"
                style={{
                  width: '45%',
                  aspectRatio: aspectValue ? aspectValue : 3/4,
                  left: '50%',
                  top: '50%',
                  transformOrigin: 'bottom center',
                  zIndex: index === 1 ? 30 : 20 - index,
                  borderRadius: `${cornerRadius}px`,
                  filter: shadowFilter,
                  transform: `translate(calc(-50% + ${offset.x}%), calc(-70% + ${offset.y}%)) rotate(${angle}deg) ${animStyle.transform}`,
                  opacity: animStyle.opacity,
                  transition: animationInfo ? 'none' : CSS_TRANSITIONS.stagger,
                  willChange: 'transform, opacity',
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} media={mediaAssets[index]} cornerRadius={cornerRadius} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default fallback (single)
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        ref={containerRef}
        className="relative overflow-hidden transition-[transform,box-shadow,border-radius] duration-300 ease-out"
        style={{
          ...containerStyle,
          width: aspectValue ? 'auto' : '85%',
          height: aspectValue ? '85%' : '85%',
          aspectRatio: aspectValue ? aspectValue : undefined,
          maxWidth: '85%',
          maxHeight: '85%',
          borderRadius: `${cornerRadius}px`,
          filter: shadowFilter,
          backfaceVisibility: 'hidden',
          ...styleCSS
        }}
      >
        <MediaContainer index={0} media={mediaAssets[0]} cornerRadius={cornerRadius} isPreview={isPreview} onScreenClick={onScreenClick} styleCSS={styleCSS} playing={playing} />
      </div>
    </div>
  );
};

// =============================================================================
// Memoized DeviceRenderer export - prevents unnecessary re-renders
// =============================================================================
export const DeviceRenderer = memo(DeviceRendererComponent, (prev, next) => {
  // Shallow comparison for primitives
  if (prev.rotationX !== next.rotationX) return false;
  if (prev.rotationY !== next.rotationY) return false;
  if (prev.rotationZ !== next.rotationZ) return false;
  if (prev.cornerRadius !== next.cornerRadius) return false;
  if (prev.scale !== next.scale) return false;
  if (prev.layout !== next.layout) return false;
  if (prev.aspectRatio !== next.aspectRatio) return false;
  if (prev.stylePreset !== next.stylePreset) return false;
  if (prev.shadowType !== next.shadowType) return false;
  if (prev.shadowOpacity !== next.shadowOpacity) return false;
  if (prev.shadowColor !== next.shadowColor) return false;
  if (prev.shadowBlur !== next.shadowBlur) return false;
  if (prev.shadowX !== next.shadowX) return false;
  if (prev.shadowY !== next.shadowY) return false;
  if (prev.isPreview !== next.isPreview) return false;
  if (prev.playing !== next.playing) return false;

  // Reference comparison for arrays/objects
  if (prev.mediaAssets !== next.mediaAssets) return false;

  // AnimationInfo deep comparison - critical for animation performance
  if (!prev.animationInfo && !next.animationInfo) return true;
  if (!prev.animationInfo || !next.animationInfo) return false;
  if (prev.animationInfo.progress !== next.animationInfo.progress) return false;
  if (prev.animationInfo.easing !== next.animationInfo.easing) return false;
  if (prev.animationInfo.stagger !== next.animationInfo.stagger) return false;
  if (prev.animationInfo.animations.length !== next.animationInfo.animations.length) return false;

  return true;
});
