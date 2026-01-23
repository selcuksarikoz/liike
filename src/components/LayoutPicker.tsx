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
} from 'lucide-react';
import { useRenderStore, type ImageLayout } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import { SidebarHeader } from './ui/SidebarPrimitives';

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

  const handleLayoutChange = (layout: ImageLayout) => {
    setImageLayout(layout);
    // Reset timeline when changing layout
    setIsPlaying(false);
    setPlayhead(0);
    clearTrack('track-animation');
  };

  return (
    <div>
      <SidebarHeader icon={<LayoutGrid className="w-4 h-4" />}>Layout</SidebarHeader>
      <div className="grid grid-cols-3 gap-2">
        {LAYOUTS.map(({ value, label, icon }) => {
          const isActive = imageLayout === value;
          return (
            <button
              key={value}
              onClick={() => handleLayoutChange(value)}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                isActive
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'border-ui-border hover:border-ui-muted bg-ui-panel/30 text-ui-muted hover:text-white'
              }`}
              title={label}
            >
              {icon}
              <span className="text-[8px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
