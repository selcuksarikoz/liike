import { memo, useRef, useEffect, useCallback } from 'react';
import { ImagePlus } from 'lucide-react';
import { useRenderStore, type MediaAsset } from '../store/renderStore';

export type MediaContainerProps = {
  index: number;
  media: MediaAsset | null;
  cornerRadius: number;
  isPreview: boolean;
  onScreenClick?: (index: number) => void;
  styleCSS: React.CSSProperties & { dropShadow?: string };
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
    playing = true,
  }: MediaContainerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const {
      mediaFit,
      mediaInnerScale,
      mediaInnerX,
      mediaInnerY,
      mediaInnerWidth,
      mediaInnerHeight,
      mediaInnerAspectRatio,
      mediaInnerRadius,
    } = useRenderStore();

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

    // Apply inner constraints
    const contentStyle: React.CSSProperties = {
      width: `${mediaInnerWidth}%`,
      height: `${mediaInnerHeight}%`,
      objectFit: mediaFit,
      aspectRatio:
        mediaInnerAspectRatio === 'free'
          ? undefined
          : mediaInnerAspectRatio === 'original'
            ? undefined
            : mediaInnerAspectRatio,
      transform: `scale(${mediaInnerScale}) translate(${mediaInnerX}%, ${mediaInnerY}%)`,
      transition: 'all 0.2s ease-out',
      // Apply user-controlled radius
      borderRadius: `${mediaInnerRadius}px`,
    };

    return (
      <div
        className={`relative w-full h-full overflow-hidden flex items-center justify-center ${isPreview ? '' : 'cursor-pointer group'}`}
        onClick={handleClick}
        style={{ borderRadius: `${cornerRadius}px` }}
      >
        {media ? (
          media.type === 'video' ? (
            <video
              ref={videoRef}
              src={media.url}
              className="block"
              style={contentStyle}
              autoPlay={playing}
              loop
              muted
              playsInline
              crossOrigin="anonymous"
            />
          ) : (
            <img
              src={media.url}
              className="block"
              style={contentStyle}
              alt="Media"
              loading="eager"
              decoding="sync"
              crossOrigin="anonymous"
            />
          )
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${isPreview ? 'p-1' : 'p-8'} ${!isPreview && 'group-hover:brightness-110'}`}
            style={{
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
              borderRadius: `${cornerRadius}px`,
              transition: 'opacity 0.3s ease',
            }}
          >
            <span className="text-[11px] text-white font-medium uppercase tracking-wider">
              Change
            </span>
          </div>
        )}
      </div>
    );
  }
);
