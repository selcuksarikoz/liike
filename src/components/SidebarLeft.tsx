import { useRef, useState, useEffect } from 'react';
import { useRenderStore, type MediaAsset } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import { ShadowGlowPanel } from './ShadowGlowPanel';
import {
  SidebarContainer,
  SidebarContent,
  SidebarHeader,
  SidebarSection,
  UploadBox,
  TabContainer,
  TabButton,
  ActionCard,
  ControlGroup,
} from './ui/SidebarPrimitives';
import { AnimationsTab } from './sidebar/AnimationsTab';
import { BackgroundModal } from './BackgroundModal';
import { FrameSelectorModal } from './modals/FrameSelectorModal';
import type { LayoutFilter } from './AnimationsPanel';
import { SliderControl } from './ui/SliderControl';
import {
  X,
  Image,
  Smartphone,
  Monitor,
  RefreshCw,
  Dice4,
  Palette,
  CircleDot,
  Square as SquareIcon,
  Laptop,
  Tablet,
  Watch,
  Check,
  Box,
  Maximize2,
} from 'lucide-react';
import { DEVICES } from '../constants/devices';
import { getFrameLabel } from '../constants/styles';
import { DropdownTrigger } from './ui/Dropdown';

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
  const [activeTab, setActiveTab] = useState<'media' | 'device'>('media');
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

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
    deviceType,
    setDeviceType,
    frameMode,
    setFrameMode,
    deviceScale,
    setDeviceScale,
    cornerRadius,
    setCornerRadius,

    // Media Inner Constraints
    mediaFit,
    setMediaFit,
    mediaInnerScale,
    setMediaInnerScale,
    mediaInnerX,
    setMediaInnerX,
    mediaInnerY,
    setMediaInnerY,
    mediaInnerWidth,
    setMediaInnerWidth,
    mediaInnerHeight,
    setMediaInnerHeight,
    mediaInnerAspectRatio,
    setMediaInnerAspectRatio,
    mediaInnerRadius,
    setMediaInnerRadius,
  } = useRenderStore();

  const [deviceCategory, setDeviceCategory] = useState<string>('phone');

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

    if (selectedSlot !== null) {
      // Single slot update
      const file = files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video/');
        updatedAssets[selectedSlot] = isVideo
          ? { url, type: 'video', duration: await getVideoDuration(url) }
          : { url, type: 'image' };
      }
      setSelectedSlot(null);
    } else {
      // Multiple or sequential update
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video/');
        const asset: MediaAsset = isVideo
          ? { url, type: 'video', duration: await getVideoDuration(url) }
          : { url, type: 'image' };

        const targetIdx = updatedAssets.indexOf(null);
        if (targetIdx !== -1) {
          updatedAssets[targetIdx] = asset;
        } else if (i < 3) {
          updatedAssets[i] = asset;
        }
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

  const handleSlotChange = (index: number) => {
    setSelectedSlot(index);
    inputRef.current?.click();
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
            <span>Style & Animation</span>
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
                multiple={selectedSlot === null}
                onChange={handleFileSelect}
              />
              <UploadBox
                onClick={() => {
                  setSelectedSlot(null);
                  inputRef.current?.click();
                }}
                maxItems={3}
              />

              <div className="grid grid-cols-3 gap-2 mt-2">
                {mediaAssets.map((asset, i) => (
                  <div
                    key={i}
                    className="relative group aspect-square rounded-xl border border-ui-border bg-ui-panel/20 overflow-hidden"
                  >
                    {asset ? (
                      <>
                        {asset.type === 'video' ? (
                          <video src={asset.url} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={asset.url} alt="" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <button
                            onClick={() => handleRemoveAsset(i)}
                            className="p-1.5 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleSlotChange(i)}
                            className="p-1.5 bg-accent text-black rounded-full hover:scale-110 transition-transform"
                            title="Change"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => handleSlotChange(i)}
                        className="w-full h-full flex items-center justify-center border border-dashed border-ui-border/50 hover:border-accent/50 hover:bg-ui-panel/40 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 text-ui-muted" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </SidebarSection>

            {/* Canvas Settings Integrated */}
            <SidebarSection borderBottom padded>
              <SidebarHeader icon={<Dice4 className="w-4 h-4" />}>Canvas Size</SidebarHeader>
              <DropdownTrigger
                icon="crop"
                label={getFrameLabel(canvasWidth, canvasHeight)}
                value={`${canvasWidth} × ${canvasHeight}`}
                onClick={() => setIsFrameModalOpen(true)}
              />
            </SidebarSection>

            <SidebarSection padded>
              <SidebarHeader icon={<Palette className="w-4 h-4" />}>
                Environment & Style
              </SidebarHeader>
              <ControlGroup>
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
                <div className="h-px bg-white/5 my-1" />
                <SliderControl
                  label="Canvas Corners"
                  icon={<CircleDot className="w-3.5 h-3.5" />}
                  value={canvasCornerRadius}
                  min={0}
                  max={100}
                  unit="px"
                  onChange={setCanvasCornerRadius}
                />
                <SliderControl
                  label="Border Width"
                  icon={<SquareIcon className="w-3.5 h-3.5" />}
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

            {/* Shadow & Glow */}
            <SidebarSection padded>
              <ShadowGlowPanel />
            </SidebarSection>

            {/* Mockup Constraints */}
            <SidebarSection padded>
              <SidebarHeader icon={<Box className="w-4 h-4" />}>Mockup Constraints</SidebarHeader>
              <ControlGroup>
                <SliderControl
                  label="Scale"
                  icon={<Maximize2 className="w-3.5 h-3.5" />}
                  value={deviceScale}
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  unit="x"
                  onChange={setDeviceScale}
                />
                <SliderControl
                  label="Corner Radius"
                  icon={<SquareIcon className="w-3.5 h-3.5" />}
                  value={cornerRadius}
                  min={0}
                  max={60}
                  unit="px"
                  onChange={setCornerRadius}
                />
              </ControlGroup>
            </SidebarSection>

            <SidebarSection padded>
              <SidebarHeader icon={<Image className="w-4 h-4" />}>Media Constraints</SidebarHeader>
              <ControlGroup>
                <div className="flex gap-2 mb-2 p-1 bg-ui-panel/40 rounded-lg">
                  {['cover', 'contain', 'fill'].map((fit) => (
                    <button
                      key={fit}
                      onClick={() => setMediaFit(fit as any)}
                      className={`flex-1 py-1 text-[10px] uppercase font-bold rounded transition-colors ${
                        mediaFit === fit ? 'bg-accent text-black' : 'text-ui-muted hover:text-white'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>

                <SliderControl
                  label="Media Scale"
                  icon={<Maximize2 className="w-3.5 h-3.5" />}
                  value={mediaInnerScale}
                  min={0.1}
                  max={3}
                  step={0.05}
                  unit="x"
                  onChange={setMediaInnerScale}
                />
                <SliderControl
                  label="Position X"
                  icon={<Box className="w-3.5 h-3.5" />}
                  value={mediaInnerX}
                  min={-100}
                  max={100}
                  unit="%"
                  onChange={setMediaInnerX}
                />
                <SliderControl
                  label="Position Y"
                  icon={<Box className="w-3.5 h-3.5" />}
                  value={mediaInnerY}
                  min={-100}
                  max={100}
                  unit="%"
                  onChange={setMediaInnerY}
                />
                <SliderControl
                  label="Width"
                  icon={<Box className="w-3.5 h-3.5" />}
                  value={mediaInnerWidth}
                  min={10}
                  max={200}
                  step={5}
                  unit="%"
                  onChange={setMediaInnerWidth}
                />
                <SliderControl
                  label="Height"
                  icon={<Box className="w-3.5 h-3.5" />}
                  value={mediaInnerHeight}
                  min={10}
                  max={200}
                  step={5}
                  unit="%"
                  onChange={setMediaInnerHeight}
                />
                <SliderControl
                  label="Radius"
                  icon={<CircleDot className="w-3.5 h-3.5" />}
                  value={mediaInnerRadius}
                  min={0}
                  max={100}
                  unit="px"
                  onChange={setMediaInnerRadius}
                />
                <div className="flex items-center justify-between pt-1">
                  <label className="text-[10px] text-ui-muted">Aspect Ratio</label>
                  <select
                    value={mediaInnerAspectRatio}
                    onChange={(e) => setMediaInnerAspectRatio(e.target.value)}
                    className="bg-ui-panel/40 text-ui-text text-[10px] rounded px-2 py-1 border border-ui-border outline-none"
                  >
                    <option value="free">Free</option>
                    <option value="original">Original</option>
                    <option value="1/1">1:1</option>
                    <option value="4/5">4:5</option>
                    <option value="16/9">16:9</option>
                    <option value="9/16">9:16</option>
                  </select>
                </div>
              </ControlGroup>
            </SidebarSection>
          </div>
        )}

        {activeTab === 'device' && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            <SidebarSection borderBottom>
              <SidebarHeader icon={<Smartphone className="w-4 h-4" />}>Device Frame</SidebarHeader>

              {/* Category Picker */}
              <div className="flex gap-1 mb-3 p-1 bg-ui-panel/40 rounded-lg">
                {[
                  { id: 'phone', icon: <Smartphone className="w-3.5 h-3.5" /> },
                  { id: 'laptop', icon: <Laptop className="w-3.5 h-3.5" /> },
                  { id: 'tablet', icon: <Tablet className="w-3.5 h-3.5" /> },
                  { id: 'desktop', icon: <Monitor className="w-3.5 h-3.5" /> },
                  { id: 'watch', icon: <Watch className="w-3.5 h-3.5" /> },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setDeviceCategory(cat.id)}
                    className={`flex-1 flex items-center justify-center p-1.5 rounded-md transition-all ${
                      deviceCategory === cat.id
                        ? 'bg-accent text-black shadow-sm'
                        : 'text-ui-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat.icon}
                  </button>
                ))}
              </div>

              {/* Horizontal Device List */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {DEVICES.filter((d) => d.type === deviceCategory).map((device) => {
                  const isActive = deviceType === device.id && frameMode === 'device';
                  return (
                    <button
                      key={device.id}
                      onClick={() => {
                        setFrameMode('device');
                        setDeviceType(device.id);
                      }}
                      className={`flex-shrink-0 w-24 aspect-[4/5] relative rounded-lg border transition-all ${
                        isActive
                          ? 'border-accent bg-accent/5 ring-1 ring-accent/20'
                          : 'border-ui-border bg-ui-panel/20 hover:border-accent/40'
                      }`}
                    >
                      <div className="absolute inset-0 p-2 flex items-center justify-center">
                        <img
                          src={device.image}
                          alt=""
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-1 bg-black/60 rounded-b-lg">
                        <span
                          className={`text-[8px] font-bold block truncate text-center ${isActive ? 'text-accent' : 'text-white/80'}`}
                        >
                          {device.name.replace('iPhone ', '').replace('MacBook ', '')}
                        </span>
                      </div>
                      {isActive && (
                        <div className="absolute top-1 right-1 bg-accent text-black rounded-full p-0.5">
                          <Check className="w-2 h-2" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* No Mockup Toggle */}
              <button
                onClick={() => setFrameMode('basic')}
                className={`w-full mt-3 p-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                  frameMode === 'basic'
                    ? 'bg-accent text-black border-accent'
                    : 'bg-ui-panel/40 text-ui-muted border-ui-border hover:border-accent/40 hover:text-white'
                }`}
              >
                No Device Mockup
              </button>
            </SidebarSection>

            <AnimationsTab layoutFilter={layoutFilter} onFilterChange={handleFilterChange} />
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
