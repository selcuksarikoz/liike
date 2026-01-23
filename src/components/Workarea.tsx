import { useRef, useState, useEffect, useMemo } from 'react';
import { useRenderStore } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import { DeviceRenderer } from './DeviceRenderer';
import { TextOverlayRenderer } from './TextOverlay';
import { useTimelinePlayback } from '../hooks/useTimelinePlayback';
import { combineAnimations, ANIMATION_PRESETS } from '../constants/animations';
import { LAYOUT_PRESETS } from '../constants/styles';
import {
  ANIMATION_SPEED_MULTIPLIERS,
  ANIMATION_SPEED_DURATIONS,
  generateDeviceKeyframes,
  type DeviceAnimationType,
} from '../constants/textAnimations';

export const Workarea = ({ stageRef }: { stageRef: React.RefObject<HTMLDivElement | null> }) => {
  const {
    rotationX,
    rotationY,
    rotationZ,
    backgroundGradient,
    backgroundType,
    backgroundColor,
    backgroundImage,
    setMediaAssets,
    mediaAssets,
    setDurationMs,
    canvasWidth,
    canvasHeight,
    canvasCornerRadius,
    canvasBorderWidth,
    canvasBorderColor,
    shadowType,
    shadowOpacity,
    shadowBlur,
    shadowColor,
    shadowX,
    shadowY,
    stylePreset,
    deviceScale,
    imageAspectRatio,
    imageLayout,
    cornerRadius,
    applyPreset,
    frameMode,
    deviceType,
    textOverlay,
    mediaOffsetX,
    mediaOffsetY,
    animationSpeed,
  } = useRenderStore();

  // Get CSS transition duration based on animation speed
  const transitionDuration = ANIMATION_SPEED_DURATIONS[animationSpeed];
  const speedMultiplier = ANIMATION_SPEED_MULTIPLIERS[animationSpeed];

  const { tracks, playheadMs } = useTimelineStore();
  const { activeClips, isPlaying } = useTimelinePlayback();

  // Calculate device animation progress (similar to text animation)
  const deviceAnimationStyle = useMemo(() => {
    const deviceAnim = textOverlay.deviceAnimation as DeviceAnimationType;
    if (!deviceAnim || deviceAnim === 'none' || !textOverlay.enabled) {
      return { opacity: 1, transform: 'none' };
    }

    // Device animation starts after a delay (synced with text animation)
    const startDelay = 400 / speedMultiplier;
    const animDuration = 800 / speedMultiplier;

    const delayedPlayhead = Math.max(0, playheadMs - startDelay);
    const progress = Math.min(1, delayedPlayhead / animDuration);

    // Always use animation keyframes - this ensures element starts hidden when animation is active
    return generateDeviceKeyframes(deviceAnim, progress);
  }, [textOverlay.deviceAnimation, textOverlay.enabled, playheadMs, speedMultiplier]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const deviceContainerRef = useRef<HTMLDivElement>(null);
  const animatedDeviceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const prevBackgroundRef = useRef<HTMLDivElement>(null);
  const [prevGradient, setPrevGradient] = useState<string>(backgroundGradient);

  // Calculate animation info for DeviceRenderer (staggered animations for duo/trio)
  const animationInfo = useMemo(() => {
    if (activeClips.length === 0) {
      return undefined;
    }

    // Get animations from all active clips
    const allAnimations: { type: string; intensity?: number }[] = [];
    let easing = 'ease-in-out';

    activeClips.forEach((clip) => {
      clip.animations.forEach((animType) => {
        allAnimations.push({ type: animType });
      });
      easing = clip.easing;
    });

    if (allAnimations.length === 0) {
      return undefined;
    }

    // Use the first clip's progress
    const progress = activeClips[0].progress;

    return {
      animations: allAnimations,
      progress,
      easing,
      stagger: 0.2, // 20% stagger between each image
    };
  }, [activeClips]);

  // Calculate animation transform for single layout (no stagger)
  const animationStyle = useMemo(() => {
    if (!animationInfo) {
      return { transform: 'none', opacity: 1 };
    }
    return combineAnimations(
      animationInfo.animations,
      animationInfo.progress,
      animationInfo.easing
    );
  }, [animationInfo]);

  // Apply layout preset from active clip if it has one
  useEffect(() => {
    if (!isPlaying) return;

    // Find if any active clip has layout preset data
    tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        if (playheadMs >= clip.startMs && playheadMs < clip.startMs + clip.durationMs) {
          const presetData = clip.data?.animationPreset;
          if (presetData?.id) {
            // Find matching layout preset
            const layoutPreset = LAYOUT_PRESETS.find((p) => p.id === presetData.id);
            if (layoutPreset) {
              // Apply only rotation from layout preset (keep current background)
              applyPreset({
                rotationX: layoutPreset.rotationX,
                rotationY: layoutPreset.rotationY,
                rotationZ: layoutPreset.rotationZ,
              });
            }
          }
        }
      });
    });
  }, [playheadMs, tracks, isPlaying, applyPreset]);

  const handleScreenClick = (index: number) => {
    setActiveMediaIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');

      if (isVideo) {
        // For video, wait for metadata to get duration before setting asset
        const tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata';
        tempVideo.onloadedmetadata = () => {
          const duration = Math.round(tempVideo.duration * 1000);
          if (duration > 0 && isFinite(duration)) {
            // Set asset WITH duration so it's available for updateRenderDuration
            const newAssets = [...mediaAssets];
            newAssets[activeMediaIndex] = { url, type: 'video', duration };
            setMediaAssets(newAssets);
            setDurationMs(duration);
          }
        };
        tempVideo.src = url;
      } else {
        // For images, set immediately
        const newAssets = [...mediaAssets];
        newAssets[activeMediaIndex] = { url, type: 'image' };
        setMediaAssets(newAssets);
      }
    }
  };

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate display dimensions to fit canvas in view while maintaining aspect ratio
  const displayDimensions = useMemo(() => {
    if (!canvasWidth || !canvasHeight || !containerSize.width || !containerSize.height) {
      return { width: 400, height: 400, scale: 0.5, innerPadding: 20 };
    }

    const padding = 80;
    const availableWidth = containerSize.width - padding;
    const availableHeight = containerSize.height - padding;

    if (availableWidth <= 0 || availableHeight <= 0) {
      return { width: 400, height: 400, scale: 0.5, innerPadding: 20 };
    }

    const aspectRatio = canvasWidth / canvasHeight;
    let displayWidth: number;
    let displayHeight: number;

    // Fit to container while maintaining aspect ratio
    if (availableWidth / availableHeight > aspectRatio) {
      // Container is wider than canvas aspect ratio - fit to height
      displayHeight = availableHeight;
      displayWidth = displayHeight * aspectRatio;
    } else {
      // Container is taller than canvas aspect ratio - fit to width
      displayWidth = availableWidth;
      displayHeight = displayWidth / aspectRatio;
    }

    const scale = displayWidth / canvasWidth;
    // Calculate inner padding (5% of smaller dimension) for smooth concentric corners
    const innerPadding = Math.min(displayWidth, displayHeight) * 0.05;

    return { width: displayWidth, height: displayHeight, scale, innerPadding };
  }, [canvasWidth, canvasHeight, containerSize]);

  // Animate background gradient changes with crossfade
  useEffect(() => {
    if (!backgroundRef.current || !prevBackgroundRef.current) return;
    if (prevGradient === backgroundGradient) return;

    // Smooth crossfade animation
    const { keyframes: fadeInKeyframes, options: fadeInOptions } =
      ANIMATION_PRESETS.backgroundFadeIn;
    const { keyframes: fadeOutKeyframes, options: fadeOutOptions } =
      ANIMATION_PRESETS.backgroundFadeOut;

    backgroundRef.current.animate([...fadeInKeyframes], fadeInOptions);
    const fadeOutAnim = prevBackgroundRef.current.animate([...fadeOutKeyframes], fadeOutOptions);

    fadeOutAnim.onfinish = () => {
      setPrevGradient(backgroundGradient);
    };
  }, [backgroundGradient, prevGradient]);

  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-canvas">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle,var(--color-ui-border)_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,video/mp4,video/quicktime,video/webm"
        onChange={handleFileChange}
      />

      <div
        ref={containerRef}
        className="relative flex flex-1 items-center justify-center p-12 overflow-hidden bg-ui-bg-secondary select-none"
      >
        {/* Background Gradient / Canvas Area */}
        <div
          ref={(el) => {
            canvasRef.current = el;
            if (stageRef && 'current' in stageRef) {
              (stageRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }
          }}
          className="relative shadow-2xl transition-all duration-300 ease-in-out flex items-center justify-center overflow-hidden"
          style={{
            width: `${displayDimensions.width}px`,
            height: `${displayDimensions.height}px`,
            borderRadius: `${canvasCornerRadius}px`,
            borderWidth: `${canvasBorderWidth}px`,
            borderColor: canvasBorderColor,
            // Fallback background for video export (prevents transparent corners)
            backgroundColor: backgroundColor || '#000',
          }}
        >
          {/* Canvas Background with Crossfade */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: `${Math.max(0, canvasCornerRadius - canvasBorderWidth)}px` }}
          >
            {/* Previous background (fades out) - only for gradient crossfade */}
            {backgroundType === 'gradient' && (
              <div
                ref={prevBackgroundRef}
                className={`absolute inset-0 bg-gradient-to-br ${prevGradient}`}
              />
            )}

            {/* Current background based on type */}
            {backgroundType === 'gradient' && (
              <div
                ref={backgroundRef}
                className={`absolute inset-0 bg-gradient-to-br ${backgroundGradient}`}
              />
            )}
            {backgroundType === 'solid' && (
              <div ref={backgroundRef} className="absolute inset-0" style={{ backgroundColor }} />
            )}
            {backgroundType === 'image' && backgroundImage && (
              <div ref={backgroundRef} className="absolute inset-0 w-full h-full">
                <img
                  src={backgroundImage}
                  className="w-full h-full object-cover object-center"
                  alt="Background"
                  decoding="sync"
                  loading="eager"
                />
              </div>
            )}
          </div>

          {/* Dynamic Mockup Render - Centered in Canvas */}
          <div
            ref={deviceContainerRef}
            className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden"
            style={{
              borderRadius: `${Math.max(0, canvasCornerRadius - canvasBorderWidth)}px`,
              // padding: '3%',
            }}
          >
            {/* Animation wrapper - only apply outer animation for single layout */}
            <div
              ref={animatedDeviceRef}
              data-device-animation={textOverlay.deviceAnimation || 'none'}
              data-base-transform={imageLayout === 'single' ? (animationStyle.transform || 'none') : 'none'}
              data-pos-transform={mediaOffsetX !== 0 || mediaOffsetY !== 0 ? `translate(${mediaOffsetX}%, ${mediaOffsetY}%)` : 'none'}
              data-base-opacity={imageLayout === 'single' ? String(animationStyle.opacity ?? 1) : '1'}
              className="transition-all ease-out w-full h-full"
              style={{
                transitionDuration: `${transitionDuration}ms`,
                transform: (() => {
                  const baseTransform =
                    imageLayout === 'single' ? animationStyle.transform : 'none';

                  // Get media transform from store
                  const posTransform =
                    mediaOffsetX !== 0 || mediaOffsetY !== 0
                      ? `translate(${mediaOffsetX}%, ${mediaOffsetY}%)`
                      : '';

                  // Add device entry animation transform
                  const deviceAnimTransform = deviceAnimationStyle.transform;

                  // Combine all transforms
                  const transforms = [baseTransform, posTransform, deviceAnimTransform]
                    .filter((t) => t && t !== 'none')
                    .join(' ');

                  return transforms || 'none';
                })(),
                opacity: (() => {
                  const baseOpacity = imageLayout === 'single' ? (animationStyle.opacity ?? 1) : 1;
                  const deviceOpacity = deviceAnimationStyle.opacity;
                  return baseOpacity * deviceOpacity;
                })(),
              }}
            >
              <DeviceRenderer
                rotationX={rotationX}
                rotationY={rotationY}
                rotationZ={rotationZ}
                cornerRadius={cornerRadius}
                mediaAssets={mediaAssets}
                onScreenClick={handleScreenClick}
                shadowType={shadowType}
                shadowOpacity={shadowOpacity}
                shadowBlur={shadowBlur}
                shadowColor={shadowColor}
                shadowX={shadowX}
                shadowY={shadowY}
                stylePreset={stylePreset}
                scale={deviceScale}
                aspectRatio={imageAspectRatio}
                layout={imageLayout}
                animationInfo={imageLayout !== 'single' ? animationInfo : undefined}
                frameMode={frameMode}
                deviceType={deviceType}
              />
            </div>

            {/* Text Overlay - renders on top of device */}
            <TextOverlayRenderer />
          </div>
        </div>
      </div>
    </section>
  );
};
