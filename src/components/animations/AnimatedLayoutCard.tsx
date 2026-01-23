import { useState, useRef, useEffect } from 'react';
import { Heart } from 'lucide-react';
import type { MediaAsset, AspectRatio, ImageLayout, BackgroundType } from '../../store/renderStore';
import type { LayoutPreset } from '../../constants/styles';
import {
  ANIMATION_PRESETS,
  combineAnimations,
  getDefaultIntensity,
  DURATIONS,
  EASINGS,
} from '../../constants/animations';
import { DeviceRenderer } from '../DeviceRenderer';

type Props = {
  preset: LayoutPreset;
  isActive: boolean;
  onApply: () => void;
  onDragStart: (e: React.DragEvent) => void;
  cornerRadius: number;
  mediaAssets: (MediaAsset | null)[];
  stylePreset?: string;
  shadowType?: string;
  shadowOpacity?: number;
  aspectRatio?: AspectRatio;
  layout?: ImageLayout;
  backgroundType: BackgroundType;
  backgroundGradient: string;
  backgroundColor: string;
  backgroundImage: string | null;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
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
}: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const hasAnimation = preset.animations.some((a) => a.type !== 'none');
  const isCombo = preset.animations.filter((a) => a.type !== 'none').length > 1;

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

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / preset.durationMs, 1);

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
          device.style.transform = result.transform;
          if (result.opacity !== undefined) {
            device.style.opacity = String(result.opacity);
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
      card.animate([...ANIMATION_PRESETS.cardHoverIn.keyframes], ANIMATION_PRESETS.cardHoverIn.options);

      if (hasAnimation) {
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
      isAnimating = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      card.animate([...ANIMATION_PRESETS.cardHoverOut.keyframes], ANIMATION_PRESETS.cardHoverOut.options);
      // Reset device transform
      device.style.transform = '';
      device.style.opacity = '1';
      device.animate([...ANIMATION_PRESETS.deviceReset.keyframes], ANIMATION_PRESETS.deviceReset.options);
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
  }, [preset, hasAnimation]);

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
      {/* Background */}
      {backgroundType === 'gradient' && (
        <div className={`absolute inset-0 bg-gradient-to-br ${backgroundGradient} opacity-80 transition-opacity group-hover:opacity-100`} />
      )}
      {backgroundType === 'solid' && (
        <div className="absolute inset-0 opacity-80 transition-opacity group-hover:opacity-100" style={{ backgroundColor }} />
      )}
      {backgroundType === 'image' && backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80 transition-opacity group-hover:opacity-100"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Device Preview */}
      <div
        ref={deviceRef}
        className="absolute inset-0 flex items-center justify-center p-4 scale-[0.85]"
        style={{ perspective: '1000px', willChange: 'transform, opacity' }}
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
          scale={0.9}
          playing={isHovered}
        />
      </div>

      {/* Badges */}
      <div className="absolute top-2 left-2 flex gap-1">
        {hasAnimation && (
          <span
            className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase"
            style={{ backgroundColor: preset.color }}
          >
            {isCombo ? 'Combo' : preset.animations[0].type}
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
          <span className="text-[8px] text-white/60">{preset.durationMs / 1000}s</span>
        </div>
      </div>
    </div>
  );
};
