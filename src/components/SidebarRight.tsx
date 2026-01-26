import { useEffect, useState } from 'react';
import { useRenderStore } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import type { LayoutFilter } from './AnimationsPanel';
import { BackgroundModal } from './BackgroundModal';
import { AspectRatioModal } from './modals/AspectRatioModal';
import { FrameSelectorModal } from './modals/FrameSelectorModal';
import { AnimationsTab } from './sidebar/AnimationsTab';
import { CanvasTab } from './sidebar/CanvasTab';
import {
  ActionCard,
  SidebarContainer,
  SidebarContent,
  SidebarSection,
  TabButton,
  TabContainer,
} from './ui/SidebarPrimitives';

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
  const [layoutFilter, setLayoutFilter] = useState<LayoutFilter>(getFilterFromLayout(imageLayout));

  useEffect(() => {
    setLayoutFilter(getFilterFromLayout(imageLayout));
  }, [imageLayout]);

  const handleFilterChange = (filter: LayoutFilter) => {
    if (getFilterFromLayout(imageLayout) === filter) {
      setLayoutFilter(filter);
      return;
    }

    setIsPlaying(false);
    setPlayhead(0);
    clearTrack('track-animation');

    const layoutMap: Partial<Record<LayoutFilter, string>> = {
      single: 'single',
      duo: 'side-by-side',
      trio: 'trio-row',
      quad: 'grid',
      creative: 'masonry',
    };

    if (layoutMap[filter]) {
      setImageLayout(layoutMap[filter] as any);
    }
    setLayoutFilter(filter);
  };

  const getBackgroundPreview = () => {
    if (backgroundType === 'solid') {
      return { style: { backgroundColor } };
    }
    if (backgroundType === 'image' && backgroundImage) {
      return {
        style: {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        },
      };
    }
    if (backgroundType === 'gradient') {
      return { className: `bg-gradient-to-br ${backgroundGradient}` };
    }
    return {};
  };

  const bgPreview = getBackgroundPreview();

  return (
    <SidebarContainer side="right">
      <SidebarSection borderBottom padded>
        <ActionCard
          label="Background"
          value={backgroundType}
          onClick={() => setIsBackgroundModalOpen(true)}
          preview={
            <div
              className={`w-10 h-10 rounded-lg border border-ui-border overflow-hidden flex-shrink-0 ${bgPreview.className || ''}`}
              style={bgPreview.style}
            />
          }
        />
      </SidebarSection>

      <TabContainer>
        <TabButton active={activeTab === 'canvas'} onClick={() => setActiveTab('canvas')}>
          Canvas
        </TabButton>
        <TabButton active={activeTab === 'animations'} onClick={() => setActiveTab('animations')}>
          Presets
        </TabButton>
      </TabContainer>

      <SidebarContent>
        {activeTab === 'animations' ? (
          <AnimationsTab layoutFilter={layoutFilter} onFilterChange={handleFilterChange} />
        ) : (
          <CanvasTab
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            canvasCornerRadius={canvasCornerRadius}
            canvasBorderWidth={canvasBorderWidth}
            canvasBorderColor={canvasBorderColor}
            imageAspectRatio={imageAspectRatio}
            onFrameClick={() => setIsFrameModalOpen(true)}
            onAspectRatioClick={() => setIsAspectRatioModalOpen(true)}
            onCornerRadiusChange={setCanvasCornerRadius}
            onBorderWidthChange={setCanvasBorderWidth}
            onBorderColorChange={setCanvasBorderColor}
          />
        )}
      </SidebarContent>

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
