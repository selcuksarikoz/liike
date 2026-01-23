import { CircleDot, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FRAMES_DATA } from '../constants/styles';
import type { ImageLayout } from '../store/renderStore';
import { useRenderStore } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import { AnimationsPanel } from './AnimationsPanel';
import { BackgroundModal } from './BackgroundModal';
import { FilterPreview } from './FilterPreview';
import { AspectRatioModal } from './modals/AspectRatioModal';
import { FrameSelectorModal } from './modals/FrameSelectorModal';
import { DropdownTrigger } from './ui/Dropdown';
import {
  ActionCard,
  ControlGroup,
  SidebarContainer,
  SidebarContent,
  SidebarHeader,
  SidebarSection,
  TabButton,
  TabContainer,
} from './ui/SidebarPrimitives';
import { SliderControl } from './ui/SliderControl';

export type LayoutFilter = 'single' | 'duo' | 'trio' | 'quad' | 'creative' | 'favorites' | 'text';

const FILTER_OPTIONS: { id: LayoutFilter; label: string; icon: string }[] = [
  { id: 'favorites', label: 'Fav', icon: 'favorite' },
  { id: 'text', label: 'Text', icon: 'text_fields' },
  { id: 'single', label: 'Single', icon: 'crop_square' },
  { id: 'duo', label: 'Duo', icon: 'view_column_2' },
  { id: 'trio', label: 'Trio', icon: 'view_week' },
  { id: 'quad', label: 'Quad', icon: 'grid_view' },
  { id: 'creative', label: 'Mix', icon: 'auto_awesome_mosaic' },
];

// Map imageLayout from store to filter type
const getFilterFromLayout = (layout: string): LayoutFilter => {
  switch (layout) {
    case 'side-by-side':
    case 'stacked':
      return 'duo';
    case 'trio-row':
    case 'trio-column':
    case 'overlap':
    case 'fan':
      return 'trio';
    case 'grid':
      return 'quad';
    case 'masonry':
    case 'mosaic':
    case 'film-strip':
    case 'creative':
      return 'creative';
    default:
      return 'single';
  }
};

export const SidebarRight = () => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'animations'>('canvas');
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
  const [isAspectRatioModalOpen, setIsAspectRatioModalOpen] = useState(false);

  const {
    backgroundType,
    backgroundGradient,
    backgroundColor,
    backgroundImage,
    setImageLayout,
    imageLayout,
    canvasWidth,
    canvasHeight,
    imageAspectRatio,
    canvasCornerRadius,
    setCanvasCornerRadius,
    canvasBorderWidth,
    setCanvasBorderWidth,
    canvasBorderColor,
    setCanvasBorderColor,
  } = useRenderStore();
  const { setIsPlaying, setPlayhead, clearTrack } = useTimelineStore();

  // Derive initial layoutFilter from store's imageLayout
  const [layoutFilter, setLayoutFilter] = useState<LayoutFilter>(getFilterFromLayout(imageLayout));

  // Sync internal filter state when global store changes (e.g. from SidebarLeft)
  useEffect(() => {
    setLayoutFilter(getFilterFromLayout(imageLayout));
  }, [imageLayout]);

  // Handle filter change - update canvas layout (filter will auto-derive)
  const handleFilterChange = (filter: LayoutFilter) => {
    // If the selected filter category matches the current layout,
    // don't reset the specific layout variant (e.g. keep 'stacked' if 'duo' is clicked)
    if (getFilterFromLayout(imageLayout) === filter) {
      setLayoutFilter(filter);
      return;
    }

    // Pause video and reset timeline
    setIsPlaying(false);
    setPlayhead(0);
    clearTrack('track-animation');

    // Update canvas layout based on filter
    switch (filter) {
      case 'single':
        setImageLayout('single');
        break;
      case 'duo':
        setImageLayout('side-by-side');
        break;
      case 'trio':
        setImageLayout('trio-row');
        break;
      case 'quad':
        setImageLayout('grid');
        break;
      case 'creative':
        setImageLayout('masonry');
        break;
    }
    setLayoutFilter(filter);
  };

  const getCurrentFrameLabel = () => {
    for (const group of FRAMES_DATA) {
      const frame = group.frames.find((f) => f.width === canvasWidth && f.height === canvasHeight);
      if (frame) return frame.label;
    }
    return `${canvasWidth} × ${canvasHeight}`;
  };

  // Generate preview style for background button
  const getBackgroundPreviewStyle = () => {
    switch (backgroundType) {
      case 'solid':
        return { backgroundColor };
      case 'image':
        return backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {};
      case 'gradient':
      default:
        return {};
    }
  };

  // Get gradient class for preview
  const getGradientClass = () => {
    if (backgroundType === 'gradient') {
      return `bg-gradient-to-br ${backgroundGradient}`;
    }
    return '';
  };

  return (
    <SidebarContainer side="right">
      {/* Background Button */}
      <SidebarSection borderBottom padded>
        <ActionCard
          label="Background"
          value={backgroundType}
          onClick={() => setIsBackgroundModalOpen(true)}
          preview={
            <div
              className={`w-10 h-10 rounded-lg border border-ui-border overflow-hidden flex-shrink-0 ${getGradientClass()}`}
              style={getBackgroundPreviewStyle()}
            />
          }
        />
      </SidebarSection>

      {/* Tab Switcher */}
      <TabContainer>
        <TabButton active={activeTab === 'canvas'} onClick={() => setActiveTab('canvas')}>
          Canvas
        </TabButton>
        <TabButton active={activeTab === 'animations'} onClick={() => setActiveTab('animations')}>
          Animations
        </TabButton>
      </TabContainer>

      {/* Layout Filter (only show when animations tab is active) */}
      {activeTab === 'animations' && (
        <SidebarSection borderBottom padded>
          <div className="relative flex flex-wrap bg-ui-panel/50 rounded-lg p-1">
            {/* Sliding indicator */}
            <div
              className="absolute top-1 bottom-1 bg-accent rounded-md transition-all duration-300 ease-out"
              style={{
                width: `calc(${100 / FILTER_OPTIONS.length}% - 4px)`,
                left: `calc(${FILTER_OPTIONS.findIndex((f) => f.id === layoutFilter) * (100 / FILTER_OPTIONS.length)}% + 2px)`,
              }}
            />
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleFilterChange(option.id)}
                className={`relative z-10 flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors duration-200 ${
                  layoutFilter === option.id ? 'text-black' : 'text-ui-muted hover:text-ui-text'
                }`}
              >
                <FilterPreview filter={option.id} isActive={layoutFilter === option.id} />
                <span className="text-[9px]">{option.label}</span>
              </button>
            ))}
          </div>
        </SidebarSection>
      )}

      <SidebarContent>
        {activeTab === 'animations' && <AnimationsPanel filter={layoutFilter} />}

        {activeTab === 'canvas' && (
          <div className="flex flex-col">
            {/* Frame Selection */}
            <SidebarSection padded>
              <SidebarHeader>Canvas Size</SidebarHeader>
              <DropdownTrigger
                icon="crop"
                label={getCurrentFrameLabel()}
                value={`${canvasWidth} × ${canvasHeight}`}
                onClick={() => setIsFrameModalOpen(true)}
              />
            </SidebarSection>

            <div className="h-px bg-ui-border mx-4" />

            {/* Canvas Style */}
            <SidebarSection padded>
              <SidebarHeader>Canvas Style</SidebarHeader>
              <ControlGroup>
                <SliderControl
                  label="Corner Radius"
                  icon={<CircleDot className="w-3.5 h-3.5" />}
                  value={canvasCornerRadius}
                  min={0}
                  max={100}
                  unit="px"
                  onChange={setCanvasCornerRadius}
                />
                <SliderControl
                  label="Border Width"
                  icon={<Square className="w-3.5 h-3.5" />}
                  value={canvasBorderWidth}
                  min={0}
                  max={20}
                  unit="px"
                  onChange={setCanvasBorderWidth}
                />
                {canvasBorderWidth > 0 && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="text-[10px] text-ui-muted">Border Color</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-ui-text font-mono uppercase">
                        {canvasBorderColor}
                      </span>
                      <input
                        type="color"
                        value={canvasBorderColor}
                        onChange={(e) => setCanvasBorderColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent"
                      />
                    </div>
                  </div>
                )}
              </ControlGroup>
            </SidebarSection>

            <div className="h-px bg-ui-border mx-4" />

            {/* Aspect Ratio */}
            <SidebarSection padded>
              <SidebarHeader>Media Aspect Ratio</SidebarHeader>
              <DropdownTrigger
                icon="aspect_ratio"
                label={imageAspectRatio === 'free' ? 'Free' : imageAspectRatio}
                value={imageAspectRatio === 'free' ? 'No constraint' : `${imageAspectRatio} ratio`}
                onClick={() => setIsAspectRatioModalOpen(true)}
              />
            </SidebarSection>
          </div>
        )}
      </SidebarContent>

      {/* Modals */}
      <BackgroundModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
      />
      <FrameSelectorModal isOpen={isFrameModalOpen} onClose={() => setIsFrameModalOpen(false)} />
      <AspectRatioModal
        isOpen={isAspectRatioModalOpen}
        onClose={() => setIsAspectRatioModalOpen(false)}
      />
    </SidebarContainer>
  );
};
