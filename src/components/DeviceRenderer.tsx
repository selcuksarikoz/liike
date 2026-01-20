import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { getShadowStyle, STYLE_PRESETS } from '../constants/styles';
import type { MediaAsset } from '../store/renderStore';

type DeviceRendererProps = {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  cornerRadius: number;
  mediaAssets: (MediaAsset | null)[];
  scale?: number;
  isPreview?: boolean;
  onScreenClick?: (index: number) => void;
  stylePreset?: string;
  shadowType?: string;
  shadowOpacity?: number;
};

export const DeviceRenderer = ({
  rotationX,
  rotationY,
  rotationZ,
  cornerRadius,
  mediaAssets,
  isPreview = false,
  onScreenClick,
  scale = 1,
  stylePreset = 'default',
  shadowType = 'spread',
  shadowOpacity = 40,
}: DeviceRendererProps) => {
  const deviceRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    if (!deviceRef.current || isPreview) return;

    gsap.fromTo(deviceRef.current,
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.4)' }
    );
  }, [isPreview]);

  // Smooth rotation animation
  useEffect(() => {
    if (!deviceRef.current || isPreview) return;

    gsap.to(deviceRef.current, {
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
          { opacity: 0, scale: 1.1 },
          { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
        );
      }
    }, [media]);

    return (
      <div
        ref={mediaRef}
        className={`relative flex h-full w-full items-center justify-center bg-cover bg-center text-center overflow-hidden transition-all duration-300 ${isPreview ? '' : 'cursor-pointer group hover:scale-[1.02]'}`}
        onClick={() => !isPreview && onScreenClick?.(index)}
        style={{ borderRadius: `${Math.max(0, cornerRadius - 4)}px` }}
      >
        {media ? (
          media.type === 'video' ? (
            <video src={media.url} className="w-full h-full object-cover transition-transform duration-500" autoPlay loop muted playsInline />
          ) : (
            <img src={media.url} className="w-full h-full object-cover transition-transform duration-500" alt="Selected media" />
          )
        ) : (
          <div
            className={`w-full h-full bg-cover bg-center flex items-center justify-center ${isPreview ? 'p-1' : 'p-4'} transition-all duration-300 bg-zinc-900 ${!isPreview && 'group-hover:bg-zinc-800'}`}
          >
            <div className={`flex flex-col items-center gap-2 text-ui-text ${!isPreview && 'group-hover:text-accent group-hover:scale-110'} transition-all duration-300`}>
              <span className={`material-symbols-outlined ${isPreview ? 'text-xl' : 'text-4xl'}`}>add_photo_alternate</span>
              {!isPreview && <span className="text-[10px] uppercase tracking-widest font-bold">Drop or Paste</span>}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Get computed shadow based on type and rotation
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

  const containerStyle = {
    transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ || 0}deg) scale(${scale})`,
    transformStyle: 'preserve-3d' as const,
  };

  // Simple phone frame
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        ref={deviceRef}
        className="relative flex flex-col items-center justify-center bg-black border-[clamp(4px,1.5cqw,12px)] border-ui-border transition-all duration-500"
        style={{
          aspectRatio: '9/19.5',
          height: '90%',
          ...containerStyle,
          borderRadius: `${cornerRadius}px`,
          boxShadow: computedShadow(),
          backfaceVisibility: 'hidden',
          ...styleCSS
        }}
      >
        <div className="absolute top-0 z-10 flex h-[3%] w-1/3 items-center justify-center rounded-b-xl bg-black">
          <div className="h-[30%] w-[50%] rounded-full bg-zinc-800" />
        </div>
        <div className="w-full h-full pt-[4%] pb-[2%] px-[2%]">
          <div className="w-full h-full overflow-hidden" style={{ borderRadius: `${Math.max(0, cornerRadius - 8)}px` }}>
            <MediaContainer index={0} />
          </div>
        </div>
      </div>
    </div>
  );
};
