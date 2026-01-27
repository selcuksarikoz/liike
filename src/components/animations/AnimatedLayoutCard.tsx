import { useState, useRef, useEffect, useMemo } from 'react';
import { Heart } from 'lucide-react';
import type { MediaAsset, AspectRatio, ImageLayout, BackgroundType } from '../../store/renderStore';
import type { LayoutPreset } from '../../constants/styles';
import type { ShadowType } from '../DeviceRenderer';
import {
  ANIMATION_PRESETS,
  combineAnimations,
  getDefaultIntensity,
  DURATIONS,
  EASINGS,
} from '../../constants/animations';
import { DeviceRenderer } from '../DeviceRenderer';
import {
  generateTextKeyframes,
  generateDeviceKeyframes,
  ANIMATION_SPEED_MULTIPLIERS,
  type TextAnimationType,
  type DeviceAnimationType,
  type AnimationSpeed,
} from '../../constants/layoutAnimationPresets';

type Props = {
  preset: LayoutPreset;
  isActive: boolean;
  onApply: () => void;
  onDragStart: (e: React.DragEvent) => void;
  cornerRadius: number;
  mediaAssets: (MediaAsset | null)[];
  stylePreset?: string;
  shadowType?: ShadowType;
  shadowOpacity?: number;
  aspectRatio?: AspectRatio;
  layout?: ImageLayout;
  backgroundType: BackgroundType;
  backgroundGradient: string;
  backgroundColor: string;
  backgroundImage: string | null;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  animationSpeed?: AnimationSpeed;
};

export const AnimatedLayoutCard = ({
  preset,
  isActive,
  onApply,
  onDragStart,
  cornerRadius,
  mediaAssets,
  stylePreset,
  shadowType,
  shadowOpacity,
  aspectRatio,
  layout,
  backgroundType,
  backgroundGradient,
  backgroundColor,
  backgroundImage,
  isFavorite = false,
  onToggleFavorite,
  animationSpeed = 'normal',
}: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  const hasAnimation = preset.animations.some((a) => a.type !== 'none');
  const isCombo = preset.animations.filter((a) => a.type !== 'none').length > 1;
  const isTextPreset = preset.category === 'text' && preset.text?.enabled;

  // Get device config from preset
  const deviceConfig = useMemo(() => {
    if (!preset.device) return null;
    return {
      position: preset.device.position || 'center',
      scale: preset.device.scale || 1,
      offsetX: preset.device.offsetX || 0,
      offsetY: preset.device.offsetY || 0,
      animation: preset.device.animation || 'none',
      animateIn: preset.device.animateIn || false,
    };
  }, [preset.device]);

  // Get text config from preset
  const textConfig = useMemo(() => {
    if (!preset.text) return null;
    return {
      headline: preset.text.headline || '',
      tagline: preset.text.tagline || '',
      animation: (preset.text.animation || 'fade') as TextAnimationType,
      position: preset.text.position || 'top-center',
      fontSize: (preset.text.headlineFontSize || 64) * 0.15, // Scale down for preview
      taglineFontSize: (preset.text.taglineFontSize || 24) * 0.15,
      color: preset.text.color || '#ffffff',
    };
  }, [preset.text]);

  useEffect(() => {
    if (!cardRef.current || !deviceRef.current) return;

    const card = cardRef.current;
    const device = deviceRef.current;
    let animationFrameId: number | null = null;
    let startTime: number | null = null;
    let isAnimating = false;

    // Progress-based animation loop (matches main canvas behavior)
    const runProgressAnimation = () => {
      isAnimating = true;
      startTime = null;

      const animate = (currentTime: number) => {
        if (!isAnimating) return;

        if (startTime === null) {
          startTime = currentTime;
        }

        const multiplier = ANIMATION_SPEED_MULTIPLIERS[animationSpeed] || 1;
        const effectiveDuration = preset.durationMs / multiplier;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / effectiveDuration, 1);
        setAnimProgress(progress);

        // Use the same animation calculation as main canvas
        const animations = preset.animations
          .filter((a) => a.type !== 'none')
          .map((a) => ({
            type: a.type,
            intensity: a.intensity || getDefaultIntensity(a.type),
          }));

        if (animations.length > 0) {
          const easing = preset.animations[0]?.easing || 'ease-in-out';
          const result = combineAnimations(animations, progress, easing);

          // For text presets, also apply device config transform
          if (isTextPreset && deviceConfig) {
            const deviceAnim = generateDeviceKeyframes(
              deviceConfig.animation as DeviceAnimationType,
              Math.min(1, progress * 2) // Device animation in first half
            );
            const posTransform = `translate(${deviceConfig.offsetX * 0.5}%, ${deviceConfig.offsetY * 0.5}%) scale(${deviceConfig.scale})`;
            device.style.transform = `${result.transform} ${posTransform} ${deviceAnim.transform}`;
            device.style.opacity = String((result.opacity ?? 1) * deviceAnim.opacity);
          } else {
            device.style.transform = result.transform;
            if (result.opacity !== undefined) {
              device.style.opacity = String(result.opacity);
            }
          }
        }

        // Loop the animation
        if (progress >= 1) {
          startTime = currentTime;
        }

        if (isAnimating) {
          animationFrameId = requestAnimationFrame(animate);
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
      card.animate(
        [...ANIMATION_PRESETS.cardHoverIn.keyframes],
        ANIMATION_PRESETS.cardHoverIn.options
      );

      if (hasAnimation || isTextPreset) {
        runProgressAnimation();
      } else {
        device.animate([{ transform: 'scale(0.9)' }], {
          duration: DURATIONS.medium,
          easing: EASINGS.easeOut,
          fill: 'forwards',
        });
      }
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setAnimProgress(0);
      isAnimating = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      card.animate(
        [...ANIMATION_PRESETS.cardHoverOut.keyframes],
        ANIMATION_PRESETS.cardHoverOut.options
      );
      // Reset device transform
      device.style.transform = '';
      device.style.opacity = '1';
      device.animate(
        [...ANIMATION_PRESETS.deviceReset.keyframes],
        ANIMATION_PRESETS.deviceReset.options
      );
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      isAnimating = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [preset, hasAnimation, isTextPreset, deviceConfig]);

  // Calculate text animation styles for preview
  const textAnimStyles = useMemo(() => {
    if (!textConfig || !isHovered) {
      return { headlineStyle: { opacity: 0 }, taglineStyle: { opacity: 0 } };
    }

    const headlineProgress = Math.min(1, animProgress * 3);
    const taglineProgress = Math.min(1, Math.max(0, animProgress - 0.15) * 3);

    const headlineAnim = generateTextKeyframes(textConfig.animation, headlineProgress);
    const taglineAnim = generateTextKeyframes(textConfig.animation, taglineProgress);

    return {
      headlineStyle: {
        opacity: headlineAnim.opacity,
        transform: headlineAnim.transform,
        filter: headlineAnim.filter,
      },
      taglineStyle: {
        opacity: taglineAnim.opacity * 0.9,
        transform: taglineAnim.transform,
        filter: taglineAnim.filter,
      },
    };
  }, [textConfig, isHovered, animProgress]);

  // Get text position styles
  const getTextPositionStyle = (): React.CSSProperties => {
    if (!textConfig) return {};
    const pos = textConfig.position;

    let justifyContent: React.CSSProperties['justifyContent'] = 'center';
    let alignItems: React.CSSProperties['alignItems'] = 'center';

    if (pos.startsWith('top')) justifyContent = 'flex-start';
    else if (pos.startsWith('bottom')) justifyContent = 'flex-end';

    if (pos.endsWith('left')) alignItems = 'flex-start';
    else if (pos.endsWith('right')) alignItems = 'flex-end';

    return {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent,
      alignItems,
      padding: '8px',
      paddingTop: pos.startsWith('top') ? '10px' : '8px',
      paddingBottom: pos.startsWith('bottom') ? '24px' : '8px',
      zIndex: 50,
      pointerEvents: 'none',
      gap: '2px',
    };
  };

  // Calculate device position for text presets
  const getDevicePositionStyle = (): React.CSSProperties => {
    if (!isTextPreset || !deviceConfig) return {};

    return {
      transform: `translate(${deviceConfig.offsetX * 0.5}%, ${deviceConfig.offsetY * 0.5}%) scale(${deviceConfig.scale})`,
    };
  };

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={onDragStart}
      onClick={onApply}
      className={`group relative w-full aspect-[16/10] cursor-pointer rounded-xl border overflow-hidden transition-colors ${
        isActive ? 'border-accent ring-2 ring-accent/30' : 'border-ui-border hover:border-accent/50'
      }`}
    >
      {/* Background - Use user's selected background for all presets */}
      {backgroundType === 'gradient' && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${backgroundGradient} opacity-80 transition-opacity group-hover:opacity-100`}
        />
      )}
      {backgroundType === 'solid' && (
        <div
          className="absolute inset-0 opacity-80 transition-opacity group-hover:opacity-100"
          style={{ backgroundColor }}
        />
      )}
      {backgroundType === 'image' && backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80 transition-opacity group-hover:opacity-100"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Text Overlay for text presets */}
      {isTextPreset && textConfig && (
        <div ref={textRef} style={getTextPositionStyle()}>
          <div
            style={{
              fontSize: `${textConfig.fontSize}px`,
              fontWeight: 700,
              color: textConfig.color,
              textAlign: 'center',
              lineHeight: 1.1,
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              ...textAnimStyles.headlineStyle,
            }}
          >
            {textConfig.headline}
          </div>
          {textConfig.tagline && (
            <div
              style={{
                fontSize: `${textConfig.taglineFontSize}px`,
                fontWeight: 400,
                color: textConfig.color,
                textAlign: 'center',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                ...textAnimStyles.taglineStyle,
              }}
            >
              {textConfig.tagline}
            </div>
          )}
        </div>
      )}

      {/* Device Preview */}
      <div
        ref={deviceRef}
        className="absolute inset-0 flex items-center justify-center p-4 scale-[0.85] overflow-hidden"
        style={{
          perspective: '1000px',
          willChange: 'transform, opacity',
          ...(!isHovered && isTextPreset ? getDevicePositionStyle() : {}),
        }}
      >
        <DeviceRenderer
          rotationX={preset.rotationX}
          rotationY={preset.rotationY}
          rotationZ={preset.rotationZ}
          cornerRadius={cornerRadius || 20}
          mediaAssets={mediaAssets}
          stylePreset={stylePreset}
          shadowType={shadowType}
          shadowOpacity={shadowOpacity}
          aspectRatio={aspectRatio}
          layout={layout}
          isPreview={true}
          scale={isTextPreset && deviceConfig ? deviceConfig.scale * 0.9 : 0.9}
          playing={isHovered}
          frameMode={preset.category === 'mockup' ? 'device' : 'basic'}
          deviceType={preset.device?.type || 'iphone-16-pro'}
          animationInfo={
            hasAnimation
              ? {
                  animations: preset.animations,
                  progress: animProgress,
                  easing: preset.animations[0]?.easing || 'ease-out',
                  stagger: preset.animations[0]?.stagger || 0.15,
                }
              : undefined
          }
        />
      </div>

      {/* Badges */}
      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
        {preset.category === 'mockup' ? (
          <span className="px-2 py-0.5 rounded-full text-[8px] font-bold text-white bg-indigo-500 shadow-lg shadow-indigo-500/30 uppercase tracking-tighter backdrop-blur-md">
            Mockup
          </span>
        ) : isTextPreset ? (
          <span className="px-2 py-0.5 rounded-full text-[8px] font-bold text-black bg-white/90 shadow-sm uppercase tracking-tighter backdrop-blur-md">
            Text
          </span>
        ) : hasAnimation ? (
          <span
            className="px-2 py-0.5 rounded-full text-[8px] font-bold text-white uppercase tracking-tighter backdrop-blur-md shadow-sm"
            style={{ backgroundColor: preset.color }}
          >
            {isCombo ? 'Combo' : preset.animations[0].type}
          </span>
        ) : null}

        {/* New 'Pro' badge for certain presets */}
        {preset.id.startsWith('mockup') && (
          <span className="px-2 py-0.5 rounded-full text-[8px] font-bold text-white bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm uppercase tracking-tighter">
            Pro
          </span>
        )}
      </div>

      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(preset.id);
          }}
          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm ${
            isFavorite
              ? 'bg-rose-500/90 text-white scale-110'
              : 'bg-black/30 text-white/60 hover:bg-black/50 hover:text-white hover:scale-110'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Preset Name & Duration */}
      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-white">{preset.name}</span>
          <span className="text-[8px] text-white/60">
            {(
              preset.durationMs /
              (ANIMATION_SPEED_MULTIPLIERS[animationSpeed] || 1) /
              1000
            ).toFixed(1)}
            s
          </span>
        </div>
      </div>
    </div>
  );
};
