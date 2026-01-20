import { useRef, useState } from 'react';
import { useRenderStore } from '../store/renderStore';
import { MockupSelector } from './MockupSelector';
import { FrameSelectorModal } from './modals/FrameSelectorModal';
import { StyleOptionsModal } from './modals/StyleOptionsModal';
import { FRAMES_DATA } from '../constants/styles';

export const SidebarLeft = () => {
  const {
    deviceModel,
    rotationX, setRotationX,
    rotationY, setRotationY,
    rotationZ, setRotationZ,
    cornerRadius, setCornerRadius,
    setMediaAssets, mediaAssets,
    canvasWidth, canvasHeight
  } = useRenderStore();

  const [isMockupSelectorOpen, setIsMockupSelectorOpen] = useState(false);
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
        const url = URL.createObjectURL(file);
        const newAssets = [...mediaAssets];
        newAssets[index] = url;
        setMediaAssets(newAssets);
    }
  };

  // Find current frame label
  const getCurrentFrameLabel = () => {
    for (const group of FRAMES_DATA) {
      const frame = group.frames.find(f => f.width === canvasWidth && f.height === canvasHeight);
      if (frame) return frame.label;
    }
    return `${canvasWidth} × ${canvasHeight}`;
  };

  return (
    <aside className="z-20 flex w-80 flex-col border-r border-[#2c393f] bg-[#141b1e] relative overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-6 p-4">

        {/* Media Selection */}
        <div>
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#9fb2bc]">Media</h2>
            <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((index) => (
                        <div
                        key={index}
                        onClick={() => (index === 0 ? fileInput1Ref : fileInput2Ref).current?.click()}
                        className="aspect-video rounded-lg border border-dashed border-[#2c393f] bg-[#1c2529] hover:bg-[#1c3b4a] hover:border-[#d4ff3f]/50 cursor-pointer flex flex-col items-center justify-center transition-colors group overflow-hidden relative"
                        >
                        <input
                            ref={index === 0 ? fileInput1Ref : fileInput2Ref}
                            type="file"
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={(e) => handleFileSelect(e, index)}
                        />
                        {mediaAssets[index] ? (
                            <img src={mediaAssets[index]} className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[#9fb2bc] group-hover:text-[#d4ff3f] mb-1 text-[20px]">add_photo_alternate</span>
                                <span className="text-[9px] text-[#9fb2bc] group-hover:text-white uppercase font-medium">Image {index + 1}</span>
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

        {/* Mockup Selector */}
        <div className="border-t border-[#2c393f] pt-6">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#9fb2bc]">Mockup</h2>
          <div className="relative">
             <button
               onClick={() => setIsMockupSelectorOpen(!isMockupSelectorOpen)}
               className="w-full flex items-center justify-between bg-[#1c2529] border border-[#2c393f] rounded-lg px-3 py-2 text-xs text-white hover:border-[#d4ff3f]/50 transition-colors"
             >
                 <span className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-[16px]">smartphone</span>
                     <span>{deviceModel || 'Select Device'}</span>
                 </span>
                 <span className="material-symbols-outlined text-[16px] text-[#9fb2bc]">expand_more</span>
             </button>

             {isMockupSelectorOpen && (
                 <MockupSelector onClose={() => setIsMockupSelectorOpen(false)} />
             )}
          </div>

          {/* Slider Controls */}
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-xs font-medium text-[#9fb2bc]">3D Rotation X</span>
                <span className="text-[10px] font-mono text-[#d4ff3f]">{rotationX}°</span>
              </div>
                <input
                  type="range" min="0" max="360" value={rotationX}
                  onChange={(e) => setRotationX(Number(e.target.value))}
                  className="w-full h-1 bg-[#2c393f] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                  title="Rotation X"
                  style={{
                    backgroundImage: `linear-gradient(to right, #d4ff3f 0%, #d4ff3f ${(rotationX / 360) * 100}%, #2c393f ${(rotationX / 360) * 100}%, #2c393f 100%)`
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-[#9fb2bc]">3D Rotation Y</span>
                  <span className="text-[10px] font-mono text-[#d4ff3f]">{rotationY}°</span>
                </div>
                <input
                  type="range" min="-180" max="180" value={rotationY}
                  onChange={(e) => setRotationY(Number(e.target.value))}
                  className="w-full h-1 bg-[#2c393f] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                  title="Rotation Y"
                  style={{
                    backgroundImage: `linear-gradient(to right, #d4ff3f 0%, #d4ff3f ${((rotationY + 180) / 360) * 100}%, #2c393f ${((rotationY + 180) / 360) * 100}%, #2c393f 100%)`
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-[#9fb2bc]">3D Rotation Z</span>
                  <span className="text-[10px] font-mono text-[#d4ff3f]">{rotationZ}°</span>
                </div>
                <input
                  type="range" min="-180" max="180" value={rotationZ}
                  onChange={(e) => setRotationZ(Number(e.target.value))}
                  className="w-full h-1 bg-[#2c393f] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                  title="Rotation Z"
                  style={{
                    backgroundImage: `linear-gradient(to right, #d4ff3f 0%, #d4ff3f ${((rotationZ + 180) / 360) * 100}%, #2c393f ${((rotationZ + 180) / 360) * 100}%, #2c393f 100%)`
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-[#9fb2bc]">Corner Radius</span>
                  <span className="text-[10px] font-mono text-[#d4ff3f]">{cornerRadius}px</span>
                </div>
                <input
                  type="range" min="0" max="100" value={cornerRadius}
                  onChange={(e) => setCornerRadius(Number(e.target.value))}
                  className="w-full h-1 bg-[#2c393f] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                  title="Corner Radius"
                  style={{
                    backgroundImage: `linear-gradient(to right, #d4ff3f 0%, #d4ff3f ${(cornerRadius / 100) * 100}%, #2c393f ${(cornerRadius / 100) * 100}%, #2c393f 100%)`
                  }}
                />
              </div>
          </div>
        </div>

        {/* Frame / Canvas Selection - Modal Trigger */}
        <div className="border-t border-[#2c393f] pt-6">
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#9fb2bc]">Frame</h2>

            <button
              onClick={() => setIsFrameModalOpen(true)}
              className="w-full flex items-center justify-between bg-[#1c2529] border border-[#2c393f] rounded-lg px-3 py-3 text-xs text-white hover:border-[#d4ff3f]/50 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-[#9fb2bc] group-hover:text-[#d4ff3f]">crop</span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{getCurrentFrameLabel()}</span>
                  <span className="text-[10px] text-[#9fb2bc]">{canvasWidth} × {canvasHeight}</span>
                </div>
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#9fb2bc]">chevron_right</span>
            </button>
        </div>

        {/* Style Options - Modal Trigger */}
        <div className="border-t border-[#2c393f] pt-6">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#9fb2bc]">Appearance</h2>

          <button
            onClick={() => setIsStyleModalOpen(true)}
            className="w-full flex items-center justify-between bg-[#1c2529] border border-[#2c393f] rounded-lg px-3 py-3 text-xs text-white hover:border-[#d4ff3f]/50 transition-colors group"
          >
            <span className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-[#9fb2bc] group-hover:text-[#d4ff3f]">palette</span>
              <span className="font-medium">Style, Border & Shadow</span>
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#9fb2bc]">chevron_right</span>
          </button>
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
