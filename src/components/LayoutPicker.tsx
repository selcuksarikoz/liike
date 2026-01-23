import {
  Square,
  Columns2,
  Columns3,
  Rows2,
  Layers,
  GalleryHorizontal,
  GalleryVertical,
  LayoutGrid,
  Grid3x3,
  LayoutTemplate,
  LayoutDashboard,
  RotateCcw,
  Sparkles,
  Film,
  Focus,
  Slash,
  Image,
  Plus,
  Newspaper,
  Star,
  Shuffle,
  Boxes,
  Layers2,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useRenderStore } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import { SidebarHeader } from './ui/SidebarPrimitives';
import { LAYOUT_CONFIGS, type ImageLayout } from '../constants/layouts';

const LAYOUT_ICONS: Record<ImageLayout, ReactNode> = {
  single: <Square className="w-3.5 h-3.5" />,
  'side-by-side': <Columns2 className="w-3.5 h-3.5" />,
  stacked: <Rows2 className="w-3.5 h-3.5" />,
  diagonal: <Slash className="w-3.5 h-3.5" />,
  polaroid: <Image className="w-3.5 h-3.5" />,
  'trio-row': <GalleryHorizontal className="w-3.5 h-3.5" />,
  'trio-column': <GalleryVertical className="w-3.5 h-3.5" />,
  fan: <Columns3 className="w-3.5 h-3.5" />,
  masonry: <LayoutTemplate className="w-3.5 h-3.5" />,
  mosaic: <Grid3x3 className="w-3.5 h-3.5" />,
  'film-strip': <Film className="w-3.5 h-3.5" />,
  spotlight: <Focus className="w-3.5 h-3.5" />,
  grid: <LayoutGrid className="w-3.5 h-3.5" />,
  overlap: <Layers className="w-3.5 h-3.5" />,
  creative: <Shuffle className="w-3.5 h-3.5" />,
  cross: <Plus className="w-3.5 h-3.5" />,
  magazine: <Newspaper className="w-3.5 h-3.5" />,
  showcase: <Star className="w-3.5 h-3.5" />,
  scattered: <Sparkles className="w-3.5 h-3.5" />,
  cascade: <Layers2 className="w-3.5 h-3.5" />,
  brick: <Boxes className="w-3.5 h-3.5" />,
  asymmetric: <LayoutDashboard className="w-3.5 h-3.5" />,
};

export const LayoutPicker = () => {
  const { imageLayout, setImageLayout } = useRenderStore();
  const { setIsPlaying, setPlayhead, clearTrack } = useTimelineStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleLayoutChange = (layout: ImageLayout) => {
    setImageLayout(layout);
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

      <div className="grid grid-cols-4 gap-1.5">
        {LAYOUT_CONFIGS.map(({ value, label, imageCount }) => (
          <button
            key={value}
            onClick={() => handleLayoutChange(value)}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border transition-all relative ${
              imageLayout === value
                ? 'bg-accent/15 border-accent text-accent'
                : 'bg-ui-panel/30 border-ui-border/50 text-ui-muted hover:border-ui-muted hover:text-white'
            }`}
            title={`${label} (${imageCount})`}
          >
            {LAYOUT_ICONS[value]}
            <span className="text-[7px] font-medium leading-tight text-center">{label}</span>
            <span className="absolute top-0.5 right-0.5 text-[6px] opacity-50">{imageCount}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
