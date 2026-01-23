import {
  Square,
  Columns2,
  Rows2,
  LayoutGrid,
  LayoutTemplate,
  Grid3x3,
  Film,
  Layers,
  CircleDot,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import { useRenderStore } from '../store/renderStore';
import type { ImageLayout } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import { SidebarHeader, GridButton } from './ui/SidebarPrimitives';

const LAYOUTS: { value: ImageLayout; label: string; icon: React.ReactNode }[] = [
  { value: 'single', label: 'Single', icon: <Square className="w-4 h-4" /> },
  { value: 'side-by-side', label: 'Side', icon: <Columns2 className="w-4 h-4" /> },
  { value: 'stacked', label: 'Stack', icon: <Rows2 className="w-4 h-4" /> },
  { value: 'grid', label: 'Grid', icon: <LayoutGrid className="w-4 h-4" /> },
  { value: 'masonry', label: 'Masonry', icon: <LayoutTemplate className="w-4 h-4" /> },
  { value: 'mosaic', label: 'Mosaic', icon: <Grid3x3 className="w-4 h-4" /> },
  { value: 'film-strip', label: 'Film', icon: <Film className="w-4 h-4" /> },
  { value: 'overlap', label: 'Overlap', icon: <Layers className="w-4 h-4" /> },
  { value: 'fan', label: 'Fan', icon: <CircleDot className="w-4 h-4" /> },
  { value: 'creative', label: 'Mix', icon: <LayoutGrid className="w-4 h-4 rotate-45" /> },
];

export const LayoutPicker = () => {
  const { imageLayout, setImageLayout } = useRenderStore();
  const { setIsPlaying, setPlayhead, clearTrack } = useTimelineStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleLayoutChange = (layout: ImageLayout) => {
    setImageLayout(layout);
    // Reset timeline when changing layout
    setIsPlaying(false);
    setPlayhead(0);
    clearTrack('track-animation');
  };

  const handleReset = () => {
    handleLayoutChange('single');
  };

  return (
    <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <SidebarHeader
        icon={<LayoutGrid className="w-4 h-4" />}
        action={
          isHovered && imageLayout !== 'single' ? (
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
        Layout
      </SidebarHeader>
      <div className="grid grid-cols-3 gap-2">
        {LAYOUTS.map(({ value, label, icon }) => (
          <GridButton
            key={value}
            active={imageLayout === value}
            onClick={() => handleLayoutChange(value)}
            icon={icon}
            label={label}
            title={label}
          />
        ))}
      </div>
    </div>
  );
};
