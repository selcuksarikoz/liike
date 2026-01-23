import {
  Sparkles,
  Star,
  Zap,
  Target,
  Eye,
  Gem,
  Crown,
  Flame,
  Sun,
  Moon,
  RotateCcw,
  Square,
} from 'lucide-react';
import { useRenderStore } from '../store/renderStore';
import { SidebarHeader } from './ui/SidebarPrimitives';
import { useState } from 'react';

// Apple-style "aha moment" creative angles
const CREATIVE_PRESETS = [
  {
    label: 'Flat',
    icon: Square,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scale: 1,
    description: 'Clean & minimal',
  },
  {
    label: 'Keynote',
    icon: Star,
    rotationX: 8,
    rotationY: 0,
    rotationZ: 0,
    scale: 1.05,
    description: 'Apple presentation style',
  },
  {
    label: 'Reveal',
    icon: Sparkles,
    rotationX: 12,
    rotationY: -8,
    rotationZ: 0,
    scale: 0.95,
    description: 'Dramatic product reveal',
  },
  {
    label: 'Spotlight',
    icon: Sun,
    rotationX: 5,
    rotationY: 0,
    rotationZ: -2,
    scale: 1.1,
    description: 'Center stage focus',
  },
  {
    label: 'Hero',
    icon: Zap,
    rotationX: -10,
    rotationY: 0,
    rotationZ: 0,
    scale: 1.15,
    description: 'Bold hero shot',
  },
  {
    label: 'Showcase',
    icon: Gem,
    rotationX: 15,
    rotationY: -15,
    rotationZ: 3,
    scale: 0.9,
    description: '3D product showcase',
  },
  {
    label: 'Premium',
    icon: Crown,
    rotationX: 8,
    rotationY: 12,
    rotationZ: -2,
    scale: 0.95,
    description: 'Luxury angle',
  },
  {
    label: 'Dynamic',
    icon: Flame,
    rotationX: 18,
    rotationY: -25,
    rotationZ: 5,
    scale: 0.85,
    description: 'Action-packed',
  },
  {
    label: 'Elegant',
    icon: Moon,
    rotationX: 5,
    rotationY: 8,
    rotationZ: -4,
    scale: 1,
    description: 'Subtle & refined',
  },
  {
    label: 'Impact',
    icon: Target,
    rotationX: -5,
    rotationY: -5,
    rotationZ: 2,
    scale: 1.2,
    description: 'Maximum impact',
  },
  {
    label: 'Cinematic',
    icon: Eye,
    rotationX: 3,
    rotationY: 0,
    rotationZ: 0,
    scale: 1.08,
    description: 'Widescreen drama',
  },
  {
    label: 'Float',
    icon: Sparkles,
    rotationX: 10,
    rotationY: 5,
    rotationZ: -3,
    scale: 0.92,
    description: 'Hovering effect',
  },
];

export const CreativeAngles = () => {
  const { setRotationX, setRotationY, setRotationZ, setDeviceScale } = useRenderStore();

  const [selectedCreativeAngle, setSelectedCreativeAngle] = useState<
    (typeof CREATIVE_PRESETS)[0] | null
  >(null);
  const [isHovered, setIsHovered] = useState(false);

  const handlePresetClick = (preset: (typeof CREATIVE_PRESETS)[0]) => {
    setRotationX(preset.rotationX);
    setRotationY(preset.rotationY);
    setRotationZ(preset.rotationZ);
    setDeviceScale(preset.scale);
    setSelectedCreativeAngle(preset);
  };

  const handleReset = () => {
    setRotationX(0);
    setRotationY(0);
    setRotationZ(0);
    setDeviceScale(1);
    setSelectedCreativeAngle(null);
  };

  return (
    <div
      className="style-section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SidebarHeader
        icon={<Sparkles className="w-4 h-4" />}
        action={
          isHovered && selectedCreativeAngle ? (
            <button
              onClick={handleReset}
              className="text-[9px] text-ui-muted hover:text-accent transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          ) : null
        }
      >
        Creative Angles
      </SidebarHeader>
      <div className="grid grid-cols-4 gap-1.5">
        {CREATIVE_PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = preset === selectedCreativeAngle;
          return (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border transition-all ${
                isActive
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-ui-panel/30 border-ui-border/50 text-ui-muted hover:border-ui-muted hover:text-white'
              }`}
              title={preset.description}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[8px] font-medium">{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
