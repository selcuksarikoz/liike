import { useState } from 'react';
import { Modal } from './Modal';
import { useRenderStore } from '../../store/renderStore';
import { FRAMES_DATA } from '../../constants/styles';
import { DEVICES } from '../../constants/devices';

type FrameSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const FrameSelectorModal = ({ isOpen, onClose }: FrameSelectorModalProps) => {
  const { canvasWidth, canvasHeight, setCanvasSize } = useRenderStore();
  const [activeTab, setActiveTab] = useState(FRAMES_DATA[0].category);

  const handleSelectFrame = (frame: { width: number; height: number }) => {
    setCanvasSize(frame.width, frame.height);
    onClose();
  };

  // Generate Device Frames dynamically
  const deviceFrames = DEVICES.map(device => {
    // Determine base resolution size
    let w, h;
    const ar = Number(device.aspectRatio); // component AR (W/H)
    
    // Logic to set high-res canvas size matching aspect ratio
    if (device.type === 'phone') {
       w = 1170; // iPhone standard width
       h = Math.round(w / ar);
    } else if (device.type === 'watch') {
       w = 800;
       h = 800;
    } else if (device.type === 'desktop' || device.type === 'laptop') {
       w = 1920; 
       h = Math.round(w / ar);
    } else {
       // Tablet
       w = 1600;
       h = Math.round(w / ar);
    }
    
    return {
       label: device.name,
       ratio: device.type.toUpperCase(),
       width: w,
       height: h,
       previewRatio: ar
    };
  });

  const allData = [
    ...FRAMES_DATA.map(cat => ({
        ...cat,
        frames: cat.frames.map(f => ({ ...f, previewRatio: f.width / f.height }))
    })),
    { 
        category: 'Devices', 
        frames: deviceFrames 
    }
  ];

  const activeFrames = allData.find(g => g.category === activeTab)?.frames || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Frame" position="center">
      <div className="p-4">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
          {allData.map(group => (
            <button
              key={group.category}
              onClick={() => setActiveTab(group.category)}
              className={`px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap border transition-colors ${
                activeTab === group.category
                  ? 'bg-accent text-black border-accent font-bold'
                  : 'bg-ui-panel text-ui-muted border-ui-border hover:border-ui-muted'
              }`}
            >
              {group.category}
            </button>
          ))}
        </div>

        {/* Frame Grid */}
        <div className="grid grid-cols-3 gap-3">
          {activeFrames.map((frame, i) => {
            const isActive = canvasWidth === frame.width && canvasHeight === frame.height;
            const aspectRatio = frame.previewRatio;

            return (
              <button
                key={i}
                onClick={() => handleSelectFrame(frame)}
                className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                  isActive
                    ? 'bg-accent/10 border-accent'
                    : 'bg-ui-panel border-ui-border hover:border-accent/50'
                }`}
              >
                {/* Aspect Ratio Preview */}
                <div
                  className={`mb-3 border-2 ${isActive ? 'border-accent' : 'border-ui-muted/50 group-hover:border-accent/50'} transition-colors`}
                  style={{
                    width: aspectRatio >= 1 ? '48px' : `${48 * aspectRatio}px`,
                    height: aspectRatio >= 1 ? `${48 / aspectRatio}px` : '48px',
                  }}
                />

                <div className={`text-sm font-bold mb-1 ${isActive ? 'text-accent' : 'text-white'}`}>
                  {frame.ratio}
                </div>
                <div className="text-[10px] text-ui-muted text-center leading-tight">
                  {frame.label}
                </div>
                <div className="text-[9px] text-ui-muted/70 mt-1">
                  {frame.width} × {frame.height}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
