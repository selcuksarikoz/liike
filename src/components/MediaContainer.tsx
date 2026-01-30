import { memo, useRef, useEffect, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
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
  playheadMs?: number;
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
    playheadMs,
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
    } = useRenderStore(
      useShallow((state) => ({
        mediaFit: state.mediaFit,
        mediaInnerScale: state.mediaInnerScale,
        mediaInnerX: state.mediaInnerX,
        mediaInnerY: state.mediaInnerY,
        mediaInnerWidth: state.mediaInnerWidth,
        mediaInnerHeight: state.mediaInnerHeight,
        mediaInnerAspectRatio: state.mediaInnerAspectRatio,
        mediaInnerRadius: state.mediaInnerRadius,
      }))
    );

    const lastPlayheadRef = useRef<number | null>(null);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const clipStartMs = media?.clipStartMs ?? 0;
      const durationMs = media?.duration ?? 0;
      const relativePlayhead = typeof media?.relativePlayheadMs === 'number'
        ? media.relativePlayheadMs
        : Math.max(0, playheadMs - clipStartMs);
      if (typeof relativePlayhead !== 'number') return;

      const currentPlayhead = durationMs > 0
        ? Math.min(relativePlayhead, durationMs)
        : relativePlayhead;
      const timeS = Math.max(0, currentPlayhead) / 1000;

      if (!playing) {
        // Scrubbing mode: follow playhead tightly
        if (Math.abs(video.currentTime - timeS) > 0.03) {
          video.currentTime = timeS;
        }
        if (!video.paused) video.pause();
        lastPlayheadRef.current = null;
      } else {
        // Playback mode: let the video play naturally
        if (video.paused) {
          video.play().catch(() => {});
        }

        // Only seek if the playhead jumped (manual user action)
        // vs natural progression (frame-by-frame)
        if (lastPlayheadRef.current !== null) {
          const playheadJump = Math.abs(currentPlayhead - lastPlayheadRef.current);
          // If playhead moved more than 200ms between effect runs, it's a jump
          if (playheadJump > 200) {
            video.currentTime = timeS;
          }
        } else {
          // First sync when starting playback
          video.currentTime = timeS;
        }

        // Fallback: stay within reasonable sync limit (1.5s)
        if (Math.abs(video.currentTime - timeS) > 1.5) {
          video.currentTime = timeS;
        }

          lastPlayheadRef.current = currentPlayhead;
      }
    }, [playing, playheadMs, media?.relativePlayheadMs, media?.duration, media?.clipStartMs]);

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
          data-clip-start-ms={media?.clipStartMs ?? 0}
          data-clip-duration-ms={media?.duration ?? 0}
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
