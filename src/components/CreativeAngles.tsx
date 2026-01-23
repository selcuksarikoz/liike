import {
  ArrowUpDown,
  ArrowLeftRight,
  RotateCw,
  Maximize2,
  CloudFog,
  Box,
  Move3d,
  Sparkles,
  Square,
  Smartphone,
  RotateCcw,
} from 'lucide-react';
import { useRenderStore } from '../store/renderStore';
import { SidebarHeader, GridButton } from './ui/SidebarPrimitives';
import { useState } from 'react';

const CREATIVE_PRESETS = [
  {
    label: 'Isometric',
    icon: Box,
    rotationX: 30,
    rotationY: -45,
    rotationZ: 0,
    scale: 0.85,
  },
  {
    label: 'Floating',
    icon: CloudFog,
    rotationX: 15,
    rotationY: 0,
    rotationZ: -5,
    scale: 0.9,
  },
  {
    label: 'Dynamic',
    icon: Move3d,
    rotationX: 20,
    rotationY: -30,
    rotationZ: 10,
    scale: 0.9,
  },
  {
    label: 'Flat Lay',
    icon: Square,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scale: 1,
  },
  {
    label: 'Cinematic',
    icon: Maximize2,
    rotationX: 5,
    rotationY: 0,
    rotationZ: 0,
    scale: 1.1,
  },
  {
    label: 'Phone',
    icon: Smartphone,
    rotationX: 10,
    rotationY: -10,
    rotationZ: 2,
    scale: 0.95,
  },
  {
    label: 'Perspective',
    icon: ArrowLeftRight,
    rotationX: 0,
    rotationY: 25,
    rotationZ: 0,
    scale: 0.95,
  },
  {
    label: 'Hero Shot',
    icon: ArrowUpDown,
    rotationX: -15,
    rotationY: 0,
    rotationZ: 0,
    scale: 1.05,
  },
  {
    label: 'Tilted',
    icon: RotateCw,
    rotationX: 5,
    rotationY: 5,
    rotationZ: -8,
    scale: 0.95,
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
      <div className="grid grid-cols-3 gap-2">
        {CREATIVE_PRESETS.map((preset) => {
          const Icon = preset.icon;
          return (
            <GridButton
              key={preset.label}
              active={preset === selectedCreativeAngle}
              onClick={() => handlePresetClick(preset)}
              icon={<Icon className="w-4 h-4" />}
              label={preset.label}
              title={preset.label}
            />
          );
        })}
      </div>
    </div>
  );
};
