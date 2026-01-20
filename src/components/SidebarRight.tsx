import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useRenderStore } from '../store/renderStore';
import { PresetCard } from './ui/PresetCard';
import { LAYOUT_PRESETS } from '../constants/styles';

export const SidebarRight = () => {
  const {
    setRotationX,
    setRotationY,
    setRotationZ,
    rotationX, rotationY, rotationZ,
    setCornerRadius,
    cornerRadius,
    mediaAssets,
    mockupType,
    shadowType,
    shadowOpacity,
    stylePreset,
    setShadowOpacity,
    deviceScale,
    setDeviceScale,
    applyPreset
  } = useRenderStore();

  const [activeTab, setActiveTab] = useState<'presets' | 'camera'>('presets');
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(null);
  const presetsContainerRef = useRef<HTMLDivElement>(null);

  // Animate presets on mount
  useEffect(() => {
    if (activeTab === 'presets' && presetsContainerRef.current) {
      const cards = presetsContainerRef.current.children;
      gsap.fromTo(cards,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: 'back.out(1.7)'
        }
      );
    }
  }, [activeTab]);

  const handleApplyPreset = (preset: typeof LAYOUT_PRESETS[0], index: number) => {
    setActivePresetIndex(index);

    // Animate the transition
    applyPreset({
      rotationX: preset.rotationX,
      rotationY: preset.rotationY,
      rotationZ: preset.rotationZ,
      backgroundGradient: preset.backgroundGradient,
    });
  };

  return (
    <aside className="flex w-80 flex-col border-l border-[#2c393f] bg-[#111618] h-full overflow-hidden">
        {/* Tab Switcher */}
        <div className="flex border-b border-[#2c393f]">
            <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'presets' ? 'text-white border-b-2 border-[#d4ff3f] bg-[#1c2529]' : 'text-[#5f6f79] hover:text-[#9fb2bc]'}`}
            >
                Presets
            </button>
            <button
                onClick={() => setActiveTab('camera')}
                className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'camera' ? 'text-white border-b-2 border-[#d4ff3f] bg-[#1c2529]' : 'text-[#5f6f79] hover:text-[#9fb2bc]'}`}
            >
                Camera & Style
            </button>
        </div>

      <div className="flex flex-col h-full overflow-y-auto">

        {activeTab === 'presets' && (
            <div ref={presetsContainerRef} className="flex-1 p-4 space-y-4">
              {LAYOUT_PRESETS.map((preset, idx) => (
                <PresetCard
                  key={preset.name}
                  preset={preset}
                  isActive={activePresetIndex === idx}
                  onClick={() => handleApplyPreset(preset, idx)}
                  cornerRadius={cornerRadius}
                  mockupType={mockupType}
                  mediaAssets={mediaAssets}
                  stylePreset={stylePreset}
                  shadowType={shadowType}
                  shadowOpacity={shadowOpacity}
                />
              ))}
            </div>
        )}

        {activeTab === 'camera' && (
            <div className="p-5 space-y-6">

                {/* 3D Rotation Controls */}
                <div className="space-y-3">
                    <h3 className="text-[10px] uppercase font-bold text-[#5f6f79] tracking-widest">3D Rotation</h3>
                    <div className="space-y-2">
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-[#9fb2bc]">Rotate X ({rotationX}°)</span>
                            <input
                                type="range" min="-60" max="60" value={rotationX}
                                onChange={(e) => setRotationX(Number(e.target.value))}
                                className="w-full accent-[#d4ff3f] h-1 bg-[#2c393f] rounded-lg appearance-none cursor-pointer"
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-[#9fb2bc]">Rotate Y ({rotationY}°)</span>
                            <input
                                type="range" min="-60" max="60" value={rotationY}
                                onChange={(e) => setRotationY(Number(e.target.value))}
                                className="w-full accent-[#d4ff3f] h-1 bg-[#2c393f] rounded-lg appearance-none cursor-pointer"
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-[#9fb2bc]">Rotate Z ({rotationZ}°)</span>
                            <input
                                type="range" min="-45" max="45" value={rotationZ}
                                onChange={(e) => setRotationZ(Number(e.target.value))}
                                className="w-full accent-[#d4ff3f] h-1 bg-[#2c393f] rounded-lg appearance-none cursor-pointer"
                            />
                        </label>
                    </div>
                </div>

                <div className="h-px bg-[#2c393f]" />

                {/* Appearance Controls */}
                 <div className="space-y-3">
                    <h3 className="text-[10px] uppercase font-bold text-[#5f6f79] tracking-widest">Appearance</h3>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-[#9fb2bc]">Shadow Opacity ({shadowOpacity}%)</span>
                        <input
                            type="range" min="0" max="100" value={shadowOpacity}
                            onChange={(e) => setShadowOpacity(Number(e.target.value))}
                            className="w-full accent-[#d4ff3f] h-1 bg-[#2c393f] rounded-lg appearance-none cursor-pointer"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-[#9fb2bc]">Device Scale ({deviceScale.toFixed(2)}x)</span>
                        <input
                            type="range" min="0.5" max="1.5" step="0.05" value={deviceScale}
                            onChange={(e) => setDeviceScale(Number(e.target.value))}
                            className="w-full accent-[#d4ff3f] h-1 bg-[#2c393f] rounded-lg appearance-none cursor-pointer"
                        />
                    </label>

                     <label className="flex flex-col gap-1">
                        <span className="text-xs text-[#9fb2bc]">Device Roundness ({cornerRadius}px)</span>
                        <input
                            type="range" min="0" max="60" value={cornerRadius}
                            onChange={(e) => setCornerRadius(Number(e.target.value))}
                            className="w-full accent-[#d4ff3f] h-1 bg-[#2c393f] rounded-lg appearance-none cursor-pointer"
                        />
                    </label>
                 </div>

            </div>
        )}

      </div>
    </aside>
  );
};
