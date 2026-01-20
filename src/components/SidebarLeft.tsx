import { useRef, useState } from 'react';
import { Plus, X, Square, Columns2, Rows2, LayoutGrid, Layers, CircleDot } from 'lucide-react';
import { useRenderStore } from '../store/renderStore';
import type { ImageLayout } from '../store/renderStore';
import { FrameSelectorModal } from './modals/FrameSelectorModal';
import { AspectRatioModal } from './modals/AspectRatioModal';
import { FRAMES_DATA } from '../constants/styles';
import { DropdownTrigger } from './ui/Dropdown';

const LAYOUTS: { value: ImageLayout; label: string; icon: React.ReactNode }[] = [
  { value: 'single', label: 'Single', icon: <Square className="w-5 h-5" /> },
  { value: 'side-by-side', label: 'Side', icon: <Columns2 className="w-5 h-5" /> },
  { value: 'stacked', label: 'Stack', icon: <Rows2 className="w-5 h-5" /> },
  { value: 'grid', label: 'Grid', icon: <LayoutGrid className="w-5 h-5" /> },
  { value: 'overlap', label: 'Overlap', icon: <Layers className="w-5 h-5" /> },
  { value: 'fan', label: 'Fan', icon: <CircleDot className="w-5 h-5" /> },
  { value: 'creative', label: 'Mix', icon: <LayoutGrid className="w-5 h-5 rotate-45" /> },
];

const IMAGE_SLOTS = [0, 1, 2, 3];

export const SidebarLeft = () => {
  const {
    setMediaAssets, mediaAssets,
    canvasWidth, canvasHeight,
    imageAspectRatio,
    imageLayout, setImageLayout
  } = useRenderStore();

  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
  const [isAspectRatioModalOpen, setIsAspectRatioModalOpen] = useState(false);
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      const newAssets = [...mediaAssets];
      newAssets[index] = { url, type: isVideo ? 'video' : 'image' };
      setMediaAssets(newAssets);
    }
  };

  const handleRemoveMedia = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newAssets = [...mediaAssets];
    newAssets[index] = null;
    setMediaAssets(newAssets);
  };

  const getCurrentFrameLabel = () => {
    for (const group of FRAMES_DATA) {
      const frame = group.frames.find(f => f.width === canvasWidth && f.height === canvasHeight);
      if (frame) return frame.label;
    }
    return `${canvasWidth} × ${canvasHeight}`;
  };

  return (
    <aside className="z-20 flex w-80 flex-col border-r border-ui-border bg-ui-bg relative overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-6 p-4">

        {/* Media Selection */}
        <div>
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-ui-text">Images</h2>
          <div className="grid grid-cols-4 gap-2">
            {IMAGE_SLOTS.map((index) => (
              <div
                key={index}
                onClick={() => fileInputRefs[index].current?.click()}
                className="aspect-square rounded-lg border border-dashed border-ui-border bg-ui-panel hover:bg-ui-highlight hover:border-accent/50 cursor-pointer flex flex-col items-center justify-center transition-colors group overflow-hidden relative"
              >
                <input
                  ref={fileInputRefs[index]}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={(e) => handleFileSelect(e, index)}
                />
                {mediaAssets[index] ? (
                  mediaAssets[index]?.type === 'video' ? (
                    <video src={mediaAssets[index]?.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={mediaAssets[index]?.url} className="w-full h-full object-cover" alt="" />
                  )
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded bg-ui-highlight/50 flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5 text-ui-muted group-hover:text-accent transition-colors" />
                    </div>
                    <span className="text-[8px] text-ui-muted group-hover:text-white font-medium">
                      {index === 0 ? '1' : index === 1 ? '2' : index === 2 ? '3' : '4'}
                    </span>
                  </div>
                )}
                {mediaAssets[index] && (
                  <>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-[9px] text-white font-medium">Change</span>
                    </div>
                    <button
                      onClick={(e) => handleRemoveMedia(index, e)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>


        {/* Frame Selection */}
        <div className="border-t border-ui-border pt-6">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-ui-text">Canvas</h2>
          <DropdownTrigger
            icon="crop"
            label={getCurrentFrameLabel()}
            value={`${canvasWidth} × ${canvasHeight}`}
            onClick={() => setIsFrameModalOpen(true)}
          />
        </div>

        {/* Aspect Ratio */}
        <div className="border-t border-ui-border pt-6">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-ui-text">Image   Aspect Ratio</h2>
          <DropdownTrigger
            icon="aspect_ratio"
            label={imageAspectRatio === 'free' ? 'Free' : imageAspectRatio}
            value={imageAspectRatio === 'free' ? 'No constraint' : `${imageAspectRatio} ratio`}
            onClick={() => setIsAspectRatioModalOpen(true)}
          />
        </div>

        {/* Layout */}
        <div className="border-t border-ui-border pt-6">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-ui-text">Layout</h2>
          <div className="grid grid-cols-3 gap-2">
            {LAYOUTS.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setImageLayout(value)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-all ${
                  imageLayout === value
                    ? 'bg-accent text-black'
                    : 'bg-ui-panel text-ui-text hover:bg-ui-highlight hover:text-white'
                }`}
              >
                {icon}
                <span className="text-[8px] font-medium uppercase">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <FrameSelectorModal
        isOpen={isFrameModalOpen}
        onClose={() => setIsFrameModalOpen(false)}
      />
      <AspectRatioModal
        isOpen={isAspectRatioModalOpen}
        onClose={() => setIsAspectRatioModalOpen(false)}
      />
    </aside>
  );
};
