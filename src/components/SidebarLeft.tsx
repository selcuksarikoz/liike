import { useRef, useState } from 'react';
import { useRenderStore } from '../store/renderStore';
import { FrameSelectorModal } from './modals/FrameSelectorModal';
import { StyleOptionsModal } from './modals/StyleOptionsModal';
import { FRAMES_DATA } from '../constants/styles';
import { DropdownTrigger } from './ui/Dropdown';

export const SidebarLeft = () => {
  const {
    setMediaAssets, mediaAssets,
    canvasWidth, canvasHeight,
    stylePreset
  } = useRenderStore();

  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

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

  const getCurrentFrameLabel = () => {
    for (const group of FRAMES_DATA) {
      const frame = group.frames.find(f => f.width === canvasWidth && f.height === canvasHeight);
      if (frame) return frame.label;
    }
    return `${canvasWidth} × ${canvasHeight}`;
  };

  const getStyleLabel = () => {
    const labels: Record<string, string> = {
      'default': 'Default',
      'glass-light': 'Glass Light',
      'glass-dark': 'Glass Dark',
      'liquid': 'Liquid',
      'inset-light': 'Inset Light',
      'inset-dark': 'Inset Dark',
      'outline': 'Outline',
      'border': 'Border'
    };
    return labels[stylePreset] || 'Default';
  };

  return (
    <aside className="z-20 flex w-80 flex-col border-r border-ui-border bg-ui-bg relative overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-6 p-4">

        {/* Media Selection */}
        <div>
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-ui-text">Media</h2>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((index) => (
              <div
                key={index}
                onClick={() => (index === 0 ? fileInput1Ref : fileInput2Ref).current?.click()}
                className="aspect-video rounded-lg border border-dashed border-ui-border bg-ui-panel hover:bg-ui-highlight hover:border-accent/50 cursor-pointer flex flex-col items-center justify-center transition-colors group overflow-hidden relative"
              >
                <input
                  ref={index === 0 ? fileInput1Ref : fileInput2Ref}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={(e) => handleFileSelect(e, index)}
                />
                {mediaAssets[index] ? (
                  mediaAssets[index]?.type === 'video' ? (
                    <video src={mediaAssets[index]?.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={mediaAssets[index]?.url} className="w-full h-full object-cover" />
                  )
                ) : (
                  <>
                    <span className="material-symbols-outlined text-ui-text group-hover:text-accent mb-1 text-[20px]">add_photo_alternate</span>
                    <span className="text-[9px] text-ui-text group-hover:text-white uppercase font-medium">Media {index + 1}</span>
                  </>
                )}
                {mediaAssets[index] && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] text-white font-medium">Change</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Frame Selection */}
        <div className="border-t border-ui-border pt-6">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-ui-text">Frame</h2>
          <DropdownTrigger
            icon="crop"
            label={getCurrentFrameLabel()}
            value={`${canvasWidth} × ${canvasHeight}`}
            onClick={() => setIsFrameModalOpen(true)}
          />
        </div>

        {/* Appearance Selection */}
        <div className="border-t border-ui-border pt-6">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-ui-text">Appearance</h2>
          <DropdownTrigger
            icon="palette"
            label={getStyleLabel()}
            value="Style, Border & Shadow"
            onClick={() => setIsStyleModalOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <FrameSelectorModal
        isOpen={isFrameModalOpen}
        onClose={() => setIsFrameModalOpen(false)}
      />
      <StyleOptionsModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
      />
    </aside>
  );
};
