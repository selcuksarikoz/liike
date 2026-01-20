import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { getShadowStyle, STYLE_PRESETS } from '../constants/styles';
import type { MediaAsset } from '../store/renderStore';

export type AspectRatio = 'free' | '1:1' | '4:5' | '9:16' | '16:9' | '3:4' | '4:3';

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
  layout?: 'single' | 'side-by-side' | 'stacked';
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
}: ImageRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    if (!containerRef.current || isPreview) return;

    gsap.fromTo(containerRef.current,
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.4)' }
    );
  }, [isPreview]);

  // Smooth rotation animation
  useEffect(() => {
    if (!containerRef.current || isPreview) return;

    gsap.to(containerRef.current, {
      duration: 0.4,
      ease: 'power2.out',
    });
  }, [rotationX, rotationY, rotationZ, scale, isPreview]);

  const MediaContainer = ({ index }: { index: number }) => {
    const media = mediaAssets[index];
    const mediaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!mediaRef.current || isPreview) return;
      if (media) {
        gsap.fromTo(mediaRef.current,
          { opacity: 0, scale: 1.05 },
          { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
        );
      }
    }, [media]);

    return (
      <div
        ref={mediaRef}
        className={`relative flex h-full w-full items-center justify-center overflow-hidden transition-all duration-300 ${isPreview ? '' : 'cursor-pointer group'}`}
        onClick={() => !isPreview && onScreenClick?.(index)}
        style={{ borderRadius: `${cornerRadius}px` }}
      >
        {media ? (
          media.type === 'video' ? (
            <video
              src={media.url}
              className="w-full h-full object-cover transition-transform duration-500"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={media.url}
              className="w-full h-full object-cover transition-transform duration-500"
              alt="Media"
            />
          )
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${isPreview ? 'p-1' : 'p-4'} transition-all duration-300 bg-zinc-900/80 ${!isPreview && 'group-hover:bg-zinc-800/80'}`}
            style={{ borderRadius: `${cornerRadius}px` }}
          >
            <div className={`flex flex-col items-center gap-2 text-ui-text ${!isPreview && 'group-hover:text-accent group-hover:scale-110'} transition-all duration-300`}>
              <span className={`material-symbols-outlined ${isPreview ? 'text-lg' : 'text-4xl'}`}>add_photo_alternate</span>
              {!isPreview && <span className="text-[10px] uppercase tracking-widest text-center font-bold">Add Image</span>}
            </div>
          </div>
        )}
        {/* Hover overlay */}
        {media && !isPreview && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
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

  // Get style preset CSS
  const getStyleCSS = () => {
    const preset = STYLE_PRESETS.find(p => p.id === stylePreset);
    if (!preset || stylePreset === 'default') return {};
    return preset.css;
  };

  const styleCSS = getStyleCSS();
  const aspectValue = getAspectRatioValue(aspectRatio);

  const containerStyle = {
    transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ || 0}deg) scale(${scale})`,
    transformStyle: 'preserve-3d' as const,
  };

  // Count active media
  const activeMediaCount = mediaAssets.filter(m => m !== null).length;

  // Single image layout
  if (layout === 'single' || activeMediaCount <= 1) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={containerRef}
          className="relative overflow-hidden transition-all duration-500"
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
          className="relative flex gap-4 transition-all duration-500"
          style={{
            ...containerStyle,
            width: '90%',
            height: aspectValue ? undefined : '75%',
            maxHeight: '85%',
          }}
        >
          {[0, 1].map((index) => (
            <div
              key={index}
              className="flex-1 overflow-hidden transition-all duration-500"
              style={{
                aspectRatio: aspectValue ? aspectValue : undefined,
                borderRadius: `${cornerRadius}px`,
                boxShadow: computedShadow(),
                ...styleCSS
              }}
            >
              <MediaContainer index={index} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Stacked layout (2 images)
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        ref={containerRef}
        className="relative flex flex-col gap-4 transition-all duration-500"
        style={{
          ...containerStyle,
          width: aspectValue ? undefined : '70%',
          height: '90%',
          maxWidth: '85%',
        }}
      >
        {[0, 1].map((index) => (
          <div
            key={index}
            className="flex-1 overflow-hidden transition-all duration-500"
            style={{
              aspectRatio: aspectValue ? aspectValue : undefined,
              borderRadius: `${cornerRadius}px`,
              boxShadow: computedShadow(),
              ...styleCSS
            }}
          >
            <MediaContainer index={index} />
          </div>
        ))}
      </div>
    </div>
  );
};
