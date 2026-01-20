import { useRef, useState } from 'react';
import { useRenderStore } from '../store/renderStore';
import { MockupSelector } from './MockupSelector';

const FRAMES_DATA = [
  {
      category: 'Social Media',
      frames: [
          { label: 'Instagram Post', width: 1080, height: 1080, ratio: '1:1' },
          { label: 'Instagram Portrait', width: 1080, height: 1350, ratio: '4:5' },
          { label: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16' },
          { label: 'Twitter Tweet', width: 1200, height: 675, ratio: '16:9' },
          { label: 'Twitter Header', width: 1500, height: 500, ratio: '3:1' },
          { label: 'YouTube Video', width: 1920, height: 1080, ratio: '16:9' },
          { label: 'Facebook Post', width: 1200, height: 630, ratio: '1.9:1' },
          { label: 'LinkedIn Post', width: 1200, height: 627, ratio: '1.9:1' },
          { label: 'Pinterest Standard', width: 1000, height: 1500, ratio: '2:3' },
      ]
  },
  {
      category: 'App Store (iOS)',
      frames: [
          { label: 'iPhone 6.5"', width: 1284, height: 2778, ratio: '19.5:9' },
          { label: 'iPhone 5.5"', width: 1242, height: 2208, ratio: '16:9' },
          { label: 'iPad Pro 12.9"', width: 2048, height: 2732, ratio: '4:3' },
          { label: 'Mac App Preview', width: 2880, height: 1800, ratio: '16:10' },
      ]
  },
  {
      category: 'Standard Ratios',
      frames: [
          { label: '16:9', width: 1920, height: 1080, ratio: '16:9' },
          { label: '4:3', width: 1600, height: 1200, ratio: '4:3' },
          { label: '1:1', width: 1080, height: 1080, ratio: '1:1' },
          { label: '9:16', width: 1080, height: 1920, ratio: '9:16' },
      ]
  }
];

export const SidebarLeft = () => {
  const { 
    deviceModel, 
    rotationX, setRotationX,
    rotationY, setRotationY,
    cornerRadius, setCornerRadius,
    setMediaAssets, mediaAssets,
    canvasWidth, canvasHeight, setCanvasSize
  } = useRenderStore();
  
  const [isMockupSelectorOpen, setIsMockupSelectorOpen] = useState(false);
  const [activeFrameTab, setActiveFrameTab] = useState('Social Media');
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

  return (
    <aside className="z-20 flex w-80 flex-col border-r border-[#2c393f] bg-[#141b1e] relative overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-6 p-4">
        
        {/* Media Selection (Top - "Üstüne") */}
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

        {/* Mockup Selector (Center) */}
        <div className="border-t border-[#2c393f] pt-6">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#9fb2bc]">Mockup</h2>
          <div className="relative">
             <button
               onClick={() => setIsMockupSelectorOpen(!isMockupSelectorOpen)}
               className="w-full flex items-center justify-between bg-[#1c2529] border border-[#2c393f] rounded-lg px-3 py-2 text-xs text-white hover:border-[#d4ff3f]/50 transition-colors"
             >
                 <span className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-[16px]">smartphone</span>
                     {deviceModel || 'Select Device'}
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
                {/* Custom Slider using Input Range with opacity 0 over custom UI? Or just styled Input */}
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

        {/* Frame / Canvas (Bottom - "Altına") */}
        <div className="border-t border-[#2c393f] pt-6">
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#9fb2bc]">Frame</h2>
            
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
                {FRAMES_DATA.map(group => (
                    <button
                        key={group.category}
                        onClick={() => setActiveFrameTab(group.category)}
                        className={`px-2.5 py-1 rounded-full text-[10px] whitespace-nowrap border transition-colors ${
                            activeFrameTab === group.category 
                            ? 'bg-[#d4ff3f] text-black border-[#d4ff3f] font-bold' 
                            : 'bg-[#1c2529] text-[#9fb2bc] border-[#2c393f] hover:border-[#9fb2bc]'
                        }`}
                    >
                        {group.category}
                    </button>
                ))}
            </div>

            {/* Frame Grid */}
            <div className="grid grid-cols-3 gap-2">
                {FRAMES_DATA.find(g => g.category === activeFrameTab)?.frames.map((frame, i) => {
                     const isActive = canvasWidth === frame.width && canvasHeight === frame.height;
                     return (
                         <button
                            key={i}
                            onClick={() => setCanvasSize(frame.width, frame.height)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                                isActive 
                                ? 'bg-[#d4ff3f]/10 border-[#d4ff3f]' 
                                : 'bg-[#1c2529] border-[#2c393f] hover:border-[#9fb2bc]/50'
                            }`}
                         >
                             <div className={`text-[10px] font-bold mb-0.5 ${isActive ? 'text-[#d4ff3f]' : 'text-white'}`}>{frame.ratio}</div>
                             <div className="text-[8px] text-[#9fb2bc] text-center leading-tight">{frame.label}</div>
                         </button>
                     );
                })}
            </div>
        </div>

        <div className="border-t border-[#2c393f] pt-6">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#9fb2bc]">Appearance</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'palette', label: 'Background', active: true },
              { icon: 'animation', label: 'Animation' },
              { icon: 'shadow', label: 'Shadows' },
              { icon: 'blur_on', label: 'Effects' },
            ].map((item) => (
              <button
                key={item.label}
                className={`group flex flex-col items-center gap-2 rounded-lg border p-3 ${
                  item.active
                    ? 'border-[#d4ff3f]/40 bg-[#1c2529]'
                    : 'border-[#2c393f] bg-[#1c2529] hover:border-[#d4ff3f]/60'
                } transition-all`}
              >
                <span
                  className={`material-symbols-outlined ${item.active ? 'text-[#d4ff3f]' : 'text-[#9fb2bc] group-hover:text-[#d4ff3f]'}`}
                >
                  {item.icon}
                </span>
                <span className="text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
    </aside>
  );
};
