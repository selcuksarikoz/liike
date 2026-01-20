import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { DeviceRenderer } from '../DeviceRenderer';

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
  mockupType: string;
  mediaAssets: string[];
  stylePreset?: string;
  shadowType?: string;
  shadowOpacity?: number;
};

export const PresetCard = ({
  preset,
  isActive,
  onClick,
  cornerRadius,
  mockupType,
  mediaAssets,
  stylePreset,
  shadowType,
  shadowOpacity
}: PresetCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;

    const handleMouseEnter = () => {
      gsap.to(card, {
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        duration: 0.3,
        ease: 'power2.out'
      });

      if (deviceRef.current) {
        gsap.to(deviceRef.current, {
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.7)'
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        scale: 1,
        boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
        duration: 0.3,
        ease: 'power2.out'
      });

      if (deviceRef.current) {
        gsap.to(deviceRef.current, {
          scale: 0.75,
          duration: 0.4,
          ease: 'power2.out'
        });
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
    gsap.to(cardRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
      onComplete: onClick
    });
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
        className="absolute inset-0 flex items-center justify-center p-6 scale-75 transition-transform duration-500"
      >
        <DeviceRenderer
          rotationX={preset.rotationX}
          rotationY={preset.rotationY}
          rotationZ={preset.rotationZ}
          cornerRadius={cornerRadius || 20}
          mockupType={mockupType}
          mediaAssets={mediaAssets}
          stylePreset={stylePreset}
          shadowType={shadowType}
          shadowOpacity={shadowOpacity}
          isPreview={true}
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
