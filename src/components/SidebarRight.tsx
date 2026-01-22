import { CircleDot, Columns2, Film, Grid3x3, Layers, LayoutGrid, LayoutTemplate, Rows2, Square } from 'lucide-react';
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
import { ActionCard, ControlGroup, SidebarContainer, SidebarContent, SidebarHeader, SidebarSection, TabButton, TabContainer } from './ui/SidebarPrimitives';
import { SliderControl } from './ui/SliderControl';

export type LayoutFilter = 'single' | 'duo' | 'trio' | 'quad' | 'creative';

const FILTER_OPTIONS: { id: LayoutFilter; label: string; icon: string }[] = [
  { id: 'single', label: 'Single', icon: 'crop_square' },
  { id: 'duo', label: 'Duo', icon: 'view_column_2' },
  { id: 'trio', label: 'Trio', icon: 'view_week' },
  { id: 'quad', label: 'Quad', icon: 'grid_view' },
  { id: 'creative', label: 'Mix', icon: 'auto_awesome_mosaic' },
];

const LAYOUTS: { value: ImageLayout; label: string; icon: React.ReactNode }[] = [
  { value: 'single', label: 'Single', icon: <Square className="w-5 h-5" /> },
  { value: 'side-by-side', label: 'Side', icon: <Columns2 className="w-5 h-5" /> },
  { value: 'stacked', label: 'Stack', icon: <Rows2 className="w-5 h-5" /> },
  { value: 'grid', label: 'Grid', icon: <LayoutGrid className="w-5 h-5" /> },
  { value: 'masonry', label: 'Masonry', icon: <LayoutTemplate className="w-5 h-5" /> },
  { value: 'mosaic', label: 'Mosaic', icon: <Grid3x3 className="w-5 h-5" /> },
  { value: 'film-strip', label: 'Film', icon: <Film className="w-5 h-5" /> },
  { value: 'overlap', label: 'Overlap', icon: <Layers className="w-5 h-5" /> },
  { value: 'fan', label: 'Fan', icon: <CircleDot className="w-5 h-5" /> },
  { value: 'creative', label: 'Mix', icon: <LayoutGrid className="w-5 h-5 rotate-45" /> },
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
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
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
          <div className="relative flex bg-ui-panel/50 rounded-lg p-1">
            {/* Sliding indicator */}
            <div
              className="absolute top-1 bottom-1 bg-accent rounded-md transition-all duration-300 ease-out"
              style={{
                width: `calc(${100 / FILTER_OPTIONS.length}% - 4px)`,
                left: `calc(${FILTER_OPTIONS.findIndex(f => f.id === layoutFilter) * (100 / FILTER_OPTIONS.length)}% + 2px)`,
              }}
            />
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleFilterChange(option.id)}
                className={`relative z-10 flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors duration-200 ${
                  layoutFilter === option.id
                    ? 'text-black'
                    : 'text-ui-muted hover:text-ui-text'
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
                         <span className="text-[10px] text-ui-text font-mono uppercase">{canvasBorderColor}</span>
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
             
             <div className="h-px bg-ui-border mx-4" />

             {/* Layout */}
             <SidebarSection padded>
               <SidebarHeader>Layout</SidebarHeader>
               <div className="grid grid-cols-3 gap-2">
                 {LAYOUTS.map(({ value, label, icon }) => (
                   <button
                     key={value}
                     onClick={() => setImageLayout(value)}
                     className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-all border ${
                       imageLayout === value
                         ? 'bg-accent text-black border-accent'
                         : 'bg-ui-panel text-ui-text border-transparent hover:bg-ui-highlight hover:text-white hover:border-accent/30'
                     }`}
                   >
                     {icon}
                     <span className="text-[8px] font-medium uppercase">{label}</span>
                   </button>
                 ))}
               </div>
             </SidebarSection>
          </div>
        )}
      </SidebarContent>

      {/* Modals */}
      <BackgroundModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
      />
      <FrameSelectorModal 
        isOpen={isFrameModalOpen} 
        onClose={() => setIsFrameModalOpen(false)} 
      />
      <AspectRatioModal
        isOpen={isAspectRatioModalOpen}
        onClose={() => setIsAspectRatioModalOpen(false)}
      />
    </SidebarContainer>
  );
};
