import { memo, useRef, useEffect, useCallback } from 'react';
import { ImagePlus } from 'lucide-react';
import type { MediaAsset } from '../store/renderStore';

export type MediaContainerProps = {
  index: number;
  media: MediaAsset | null;
  cornerRadius: number;
  isPreview: boolean;
  onScreenClick?: (index: number) => void;
  styleCSS: React.CSSProperties & { dropShadow?: string };
  dropShadowFilter?: string; // Combined shadow filter for img/video
  playing?: boolean;
};

export const MediaContainer = memo(
  ({
    index,
    media,
    cornerRadius,
    isPreview,
    onScreenClick,
    styleCSS,
    dropShadowFilter,
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

    // Shadow applied to outer wrapper, clip to inner wrapper
    const hasShadow = dropShadowFilter && dropShadowFilter !== 'none';

    return (
      <div
        className={`relative flex h-full w-full items-center justify-center ${isPreview ? '' : 'cursor-pointer group'}`}
        onClick={handleClick}
        style={{
          borderRadius: 'inherit',
          filter: hasShadow ? dropShadowFilter : undefined,
        }}
      >
        <div
          className="relative w-full h-full overflow-hidden"
          style={{
            borderRadius: `${cornerRadius}px`,
          }}
        >
          {media ? (
            media.type === 'video' ? (
              <video
                ref={videoRef}
                src={media.url}
                className="w-full h-full object-cover block"
                autoPlay={playing}
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={media.url}
                className="w-full h-full object-cover block"
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
                backdropFilter: styleCSS.backdropFilter,
                transition: 'background 0.3s ease, border 0.3s ease',
              }}
            >
              <div
                className={`flex flex-col items-center gap-4 text-ui-text ${!isPreview && 'group-hover:text-accent group-hover:scale-110'}`}
                style={{ transition: 'color 0.3s ease, transform 0.3s ease' }}
              >
                <ImagePlus className={isPreview ? 'w-5 h-5' : 'w-16 h-16'} />
                {!isPreview && (
                  <span className="text-sm uppercase tracking-widest text-center font-bold">
                    Add Image
                  </span>
                )}
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
              <span className="text-[11px] text-white font-medium uppercase tracking-wider">
                Change
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);
