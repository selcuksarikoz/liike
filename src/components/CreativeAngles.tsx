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
} from 'lucide-react';
import { useRenderStore } from '../store/renderStore';
import { SidebarHeader } from './ui/SidebarPrimitives';
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

  const handlePresetClick = (preset: (typeof CREATIVE_PRESETS)[0]) => {
    setRotationX(preset.rotationX);
    setRotationY(preset.rotationY);
    setRotationZ(preset.rotationZ);
    setDeviceScale(preset.scale);
    setSelectedCreativeAngle(preset);
  };

  return (
    <div className="style-section">
      <SidebarHeader icon={<Sparkles className="w-4 h-4" />}>Creative Angles</SidebarHeader>
      <div className="grid grid-cols-3 gap-2">
        {CREATIVE_PRESETS.map((preset) => {
          const isActive = preset === selectedCreativeAngle;
          const IconComponent = preset.icon;
          return (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                isActive
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'border-ui-border hover:border-ui-muted bg-ui-panel/30 text-ui-muted hover:text-white'
              }`}
            >
              <span className="text-ui-muted group-hover:text-accent transition-colors">
                <IconComponent className="w-3.5 h-3.5" />
              </span>
              <span className="text-[9px] font-medium text-ui-muted group-hover:text-white transition-colors">
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
