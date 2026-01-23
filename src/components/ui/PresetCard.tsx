import { useRef, useEffect } from 'react';
import { DeviceRenderer } from '../DeviceRenderer';
import type { MediaAsset, AspectRatio, ImageLayout } from '../../store/renderStore';
import { DURATIONS, EASINGS } from '../../constants/animations';

type PresetCardProps = {
  preset: {
    name: string;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
    backgroundGradient: string;
  };
  isActive?: boolean;
  onClick: () => void;
  cornerRadius: number;
  mediaAssets: (MediaAsset | null)[];
  stylePreset?: string;
  shadowType?: string;
  shadowOpacity?: number;
  aspectRatio?: AspectRatio;
  layout?: ImageLayout;
};

export const PresetCard = ({
  preset,
  isActive,
  onClick,
  cornerRadius,
  mediaAssets,
  stylePreset,
  shadowType,
  shadowOpacity,
  aspectRatio,
  layout
}: PresetCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;

    const handleMouseEnter = () => {
      card.animate(
        [
          { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 rgba(0, 0, 0, 0))' },
          { transform: 'scale(1.02)', filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4))' }
        ],
        { duration: DURATIONS.normal, easing: EASINGS.easeOut, fill: 'forwards' }
      );

      if (deviceRef.current) {
        deviceRef.current.animate(
          [{ transform: 'scale(0.95)' }],
          { duration: DURATIONS.entrance, easing: EASINGS.bounce, fill: 'forwards' }
        );
      }
    };

    const handleMouseLeave = () => {
      card.animate(
        [
          { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 rgba(0, 0, 0, 0))' }
        ],
        { duration: DURATIONS.normal, easing: EASINGS.easeOut, fill: 'forwards' }
      );

      if (deviceRef.current) {
        deviceRef.current.animate(
          [{ transform: 'scale(0.85)' }],
          { duration: DURATIONS.standard, easing: EASINGS.easeOut, fill: 'forwards' }
        );
      }
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleClick = () => {
    if (!cardRef.current) {
      onClick();
      return;
    }

    // Click animation
    const anim = cardRef.current.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(0.95)' },
        { transform: 'scale(1)' }
      ],
      { duration: DURATIONS.fast, easing: EASINGS.easeInOut }
    );

    anim.onfinish = onClick;
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className={`group relative w-full aspect-[16/10] cursor-pointer rounded-xl border overflow-hidden transition-colors ${
        isActive
          ? 'border-accent'
          : 'border-ui-border hover:border-accent/50'
      }`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${preset.backgroundGradient} opacity-80 transition-opacity group-hover:opacity-100`} />

      {/* Device Preview */}
      <div
        ref={deviceRef}
        className="absolute inset-0 flex items-center justify-center p-4 scale-[0.85] transition-transform duration-500"
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
        />
      </div>

      {/* Preset Name */}
      <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/50 backdrop-blur-sm text-[10px] font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
        {preset.name}
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
      )}
    </div>
  );
};
