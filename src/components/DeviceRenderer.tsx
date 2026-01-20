import { useRef } from 'react';
import { ImagePlus } from 'lucide-react';
import { getShadowStyle, STYLE_PRESETS } from '../constants/styles';
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
  shadowOpacity?: number;
  layout?: 'single' | 'side-by-side' | 'stacked' | 'trio-row' | 'trio-column' | 'grid' | 'overlap' | 'fan';
  animationInfo?: AnimationInfo;
};

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
        firstAnim === 'spiral' || firstAnim === 'fan' || firstAnim === 'domino') {
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

export const DeviceRenderer = ({
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
  layout = 'single',
  animationInfo,
}: ImageRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);


  // Get style preset CSS (moved up for use in MediaContainer)
  const styleCSS = (() => {
    const preset = STYLE_PRESETS.find(p => p.id === stylePreset);
    if (!preset || stylePreset === 'default') return {};
    return preset.css;
  })();

  const MediaContainer = ({ index }: { index: number }) => {
    const media = mediaAssets[index];

    return (
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden transition-all duration-300 ${isPreview ? '' : 'cursor-pointer group'}`}
        onClick={() => !isPreview && onScreenClick?.(index)}
        style={{ borderRadius: `${cornerRadius}px` }}
      >
        {media ? (
          media.type === 'video' ? (
            <video
              src={media.url}
              className="w-full h-full object-cover transition-transform duration-500"
              style={{ borderRadius: `${cornerRadius}px` }}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={media.url}
              className="w-full h-full object-cover transition-transform duration-500"
              style={{ borderRadius: `${cornerRadius}px` }}
              alt="Media"
            />
          )
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${isPreview ? 'p-1' : 'p-8'} transition-all duration-300 ${!isPreview && 'group-hover:brightness-110'}`}
            style={{
              borderRadius: `${cornerRadius}px`,
              background: styleCSS.background || 'rgba(24, 24, 27, 0.8)',
              border: styleCSS.border || '2px dashed rgba(255, 255, 255, 0.2)',
              boxShadow: styleCSS.boxShadow,
              backdropFilter: styleCSS.backdropFilter,
            }}
          >
            <div className={`flex flex-col items-center gap-4 text-ui-text ${!isPreview && 'group-hover:text-accent group-hover:scale-110'} transition-all duration-300`}>
              <ImagePlus className={isPreview ? 'w-5 h-5' : 'w-16 h-16'} />
              {!isPreview && <span className="text-sm uppercase tracking-widest text-center font-bold">Add Image</span>}
            </div>
          </div>
        )}
        {/* Hover overlay */}
        {media && !isPreview && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity" style={{ borderRadius: `${cornerRadius}px` }}>
            <span className="text-[11px] text-white font-medium uppercase tracking-wider">Change</span>
          </div>
        )}
      </div>
    );
  };

  // Get computed shadow
  const computedShadow = () => {
    if (isPreview) return 'none';
    return getShadowStyle(shadowType, shadowOpacity, rotationX, rotationY);
  };

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
          className="relative overflow-hidden transition-all duration-300 ease-out"
          style={{
            ...containerStyle,
            width: aspectValue ? 'auto' : '85%',
            height: aspectValue ? '85%' : '85%',
            aspectRatio: aspectValue ? aspectValue : undefined,
            maxWidth: '85%',
            maxHeight: '85%',
            borderRadius: `${cornerRadius}px`,
            boxShadow: computedShadow(),
            backfaceVisibility: 'hidden',
            ...styleCSS
          }}
        >
          <MediaContainer index={0} />
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
          className="relative flex gap-4 transition-all duration-300 ease-out"
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
                  boxShadow: computedShadow(),
                  transform: animStyle.transform,
                  opacity: animStyle.opacity,
                  transition: CSS_TRANSITIONS.stagger,
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} />
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
          className="relative flex flex-col gap-4 transition-all duration-300 ease-out"
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
                  boxShadow: computedShadow(),
                  transform: animStyle.transform,
                  opacity: animStyle.opacity,
                  transition: CSS_TRANSITIONS.stagger,
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} />
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
          className="relative flex gap-3 transition-all duration-300 ease-out"
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
                  boxShadow: computedShadow(),
                  transform: animStyle.transform,
                  opacity: animStyle.opacity,
                  transition: CSS_TRANSITIONS.stagger,
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} />
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
          className="relative flex flex-col gap-3 transition-all duration-300 ease-out"
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
                  boxShadow: computedShadow(),
                  transform: animStyle.transform,
                  opacity: animStyle.opacity,
                  transition: CSS_TRANSITIONS.stagger,
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} />
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
          className="relative grid grid-cols-2 gap-3 transition-all duration-300 ease-out"
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
                  boxShadow: computedShadow(),
                  transform: animStyle.transform,
                  opacity: animStyle.opacity,
                  transition: CSS_TRANSITIONS.stagger,
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} />
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
      { x: 0, y: 0, rotate: -8, zIndex: 30 },
      { x: 25, y: 15, rotate: 0, zIndex: 20 },
      { x: 50, y: 30, rotate: 8, zIndex: 10 },
    ];
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={containerRef}
          className="relative transition-all duration-300 ease-out"
          style={{
            ...containerStyle,
            width: '70%',
            height: '70%',
          }}
        >
          {[0, 1, 2].map((index) => {
            const offset = offsets[index];
            const animStyle = getStaggeredAnimationStyle(animationInfo, index, 3);
            return (
              <div
                key={index}
                className="absolute overflow-hidden"
                style={{
                  width: '65%',
                  aspectRatio: aspectValue ? aspectValue : 3/4,
                  left: `${offset.x}%`,
                  top: `${offset.y}%`,
                  zIndex: offset.zIndex,
                  borderRadius: `${cornerRadius}px`,
                  boxShadow: computedShadow(),
                  transform: `rotate(${offset.rotate}deg) ${animStyle.transform}`,
                  opacity: animStyle.opacity,
                  transition: CSS_TRANSITIONS.stagger,
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} />
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
          className="relative transition-all duration-300 ease-out"
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
                  boxShadow: computedShadow(),
                  transform: `translate(calc(-50% + ${offset.x}%), calc(-70% + ${offset.y}%)) rotate(${angle}deg) ${animStyle.transform}`,
                  opacity: animStyle.opacity,
                  transition: CSS_TRANSITIONS.stagger,
                  ...styleCSS
                }}
              >
                <MediaContainer index={index} />
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
        className="relative overflow-hidden transition-all duration-300 ease-out"
        style={{
          ...containerStyle,
          width: aspectValue ? 'auto' : '85%',
          height: aspectValue ? '85%' : '85%',
          aspectRatio: aspectValue ? aspectValue : undefined,
          maxWidth: '85%',
          maxHeight: '85%',
          borderRadius: `${cornerRadius}px`,
          boxShadow: computedShadow(),
          backfaceVisibility: 'hidden',
          ...styleCSS
        }}
      >
        <MediaContainer index={0} />
      </div>
    </div>
  );
};
