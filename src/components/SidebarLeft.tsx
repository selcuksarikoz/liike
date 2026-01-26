import { useRef, useState, useEffect } from 'react';
import { useRenderStore, type MediaAsset, type MediaPosition } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import { CameraStylePanel } from './CameraStylePanel';
import {
  SidebarContainer,
  SidebarContent,
  SidebarHeader,
  SidebarSection,
  UploadBox,
  TabContainer,
  TabButton,
  ActionCard,
} from './ui/SidebarPrimitives';
import { AnimationsTab } from './sidebar/AnimationsTab';
import { CanvasTab } from './sidebar/CanvasTab';
import { BackgroundModal } from './BackgroundModal';
import { FrameSelectorModal } from './modals/FrameSelectorModal';
import type { LayoutFilter } from './AnimationsPanel';
import { X, Image, Smartphone, Monitor } from 'lucide-react';

const getVideoDuration = (url: string): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const durationMs = Math.round(video.duration * 1000);
      resolve(durationMs);
    };
    video.onerror = () => resolve(0);
    video.src = url;
  });
};

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
    default:
      return 'single';
  }
};

export const SidebarLeft = () => {
  const [activeTab, setActiveTab] = useState<'media' | 'device' | 'canvas'>('media');
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);

  const {
    setMediaAssets,
    mediaAssets,
    durationMs,
    setDurationMs,
    imageLayout,
    setImageLayout,
    backgroundType,
    backgroundGradient,
    backgroundColor,
    backgroundImage,
    canvasWidth,
    canvasHeight,
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

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const filesToProcess = files.slice(0, 3);
    const updatedAssets = [...mediaAssets];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      const asset: MediaAsset = isVideo
        ? { url, type: 'video', duration: await getVideoDuration(url) }
        : { url, type: 'image' };

      // Find first empty slot
      const targetIdx = updatedAssets.indexOf(null);
      if (targetIdx !== -1) {
        updatedAssets[targetIdx] = asset;
      } else if (i < 3) {
        // If all full, replace sequentially from the start
        updatedAssets[i] = asset;
      }
    }

    setMediaAssets(updatedAssets);

    const maxVideoDuration = updatedAssets.reduce((max, asset) => {
      if (asset?.type === 'video' && asset.duration) return Math.max(max, asset.duration);
      return max;
    }, 0);

    if (maxVideoDuration > durationMs) setDurationMs(maxVideoDuration);
    e.target.value = '';
  };

  const handleRemoveAsset = (index: number) => {
    const newAssets = [...mediaAssets];
    newAssets[index] = null;
    setMediaAssets(newAssets);
  };

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
    };

    if (layoutMap[filter]) setImageLayout(layoutMap[filter] as any);
    setLayoutFilter(filter);
  };

  const getBackgroundPreview = () => {
    if (backgroundType === 'solid') return { style: { backgroundColor } };
    if (backgroundType === 'image' && backgroundImage) {
      return {
        style: {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        },
      };
    }
    if (backgroundType === 'gradient')
      return { className: `bg-gradient-to-br ${backgroundGradient}` };
    return {};
  };

  const bgPreview = getBackgroundPreview();

  return (
    <SidebarContainer side="left">
      <TabContainer>
        <TabButton active={activeTab === 'media'} onClick={() => setActiveTab('media')}>
          <div className="flex flex-col items-center gap-1">
            <Image className="w-4 h-4" />
            <span>Media</span>
          </div>
        </TabButton>
        <TabButton active={activeTab === 'device'} onClick={() => setActiveTab('device')}>
          <div className="flex flex-col items-center gap-1">
            <Smartphone className="w-4 h-4" />
            <span>Device</span>
          </div>
        </TabButton>
        <TabButton active={activeTab === 'canvas'} onClick={() => setActiveTab('canvas')}>
          <div className="flex flex-col items-center gap-1">
            <Monitor className="w-4 h-4" />
            <span>Canvas</span>
          </div>
        </TabButton>
      </TabContainer>

      <SidebarContent>
        {activeTab === 'media' && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            <SidebarSection borderBottom>
              <SidebarHeader>Upload Media</SidebarHeader>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*,video/mp4,video/quicktime,video/webm"
                multiple
                onChange={handleFileSelect}
              />
              <UploadBox onClick={() => inputRef.current?.click()} maxItems={3} />
            </SidebarSection>

            <SidebarSection>
              <SidebarHeader>Assets</SidebarHeader>
              <div className="grid grid-cols-1 gap-2">
                {mediaAssets.map((asset, i) => (
                  <div
                    key={i}
                    className="relative group aspect-video rounded-xl border border-ui-border bg-ui-panel/20 overflow-hidden"
                  >
                    {asset ? (
                      <>
                        {asset.type === 'video' ? (
                          <video src={asset.url} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={asset.url} alt="" className="w-full h-full object-cover" />
                        )}
                        <button
                          onClick={() => handleRemoveAsset(i)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[9px] font-bold uppercase tracking-wider">
                          Slot {i + 1}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-ui-muted font-medium uppercase tracking-widest border border-dashed border-ui-border/50">
                        Empty Slot {i + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SidebarSection>
          </div>
        )}

        {activeTab === 'device' && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            <AnimationsTab layoutFilter={layoutFilter} onFilterChange={handleFilterChange} />
            <div className="h-px bg-ui-border mx-4 my-2" />
            <SidebarSection>
              <CameraStylePanel />
            </SidebarSection>
          </div>
        )}

        {activeTab === 'canvas' && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            <SidebarSection borderBottom padded>
              <SidebarHeader>Environment</SidebarHeader>
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

            <CanvasTab
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              canvasCornerRadius={canvasCornerRadius}
              canvasBorderWidth={canvasBorderWidth}
              canvasBorderColor={canvasBorderColor}
              onFrameClick={() => setIsFrameModalOpen(true)}
              onCornerRadiusChange={setCanvasCornerRadius}
              onBorderWidthChange={setCanvasBorderWidth}
              onBorderColorChange={setCanvasBorderColor}
            />
          </div>
        )}
      </SidebarContent>

      <BackgroundModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
      />
      <FrameSelectorModal isOpen={isFrameModalOpen} onClose={() => setIsFrameModalOpen(false)} />
    </SidebarContainer>
  );
};
