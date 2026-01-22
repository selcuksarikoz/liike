import { useState } from 'react';
import { Palette, Smartphone, Laptop, Tablet, Watch, Monitor } from 'lucide-react';
import { useRenderStore } from '../../store/renderStore';
import { STYLE_PRESETS } from '../../constants/styles';
import { Modal } from './Modal';

type FrameTab = 'styles' | 'iphone' | 'macbook' | 'ipad' | 'imac' | 'watch';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const FrameStyleModal = ({ isOpen, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<FrameTab>('styles');
  const {
    stylePreset, setStylePreset,
    frameMode, setFrameMode,
    deviceType, setDeviceType,
  } = useRenderStore();

  const handleTabChange = (tab: FrameTab) => {
    setActiveTab(tab);
    if (tab === 'styles') {
      setFrameMode('basic');
    } else {
      setFrameMode('device');
      setDeviceType(tab as any);
    }
  };

  // Sync active tab with current store state on open or change
  // Effectively when modal opens, if frameMode is device, correct tab should be active.
  // But we can just rely on `activeTab` state for UI navigation, 
  // and set store state immediately on click.

  const tabs = [
    { id: 'styles', label: 'Styles', icon: <Palette className="w-4 h-4" /> },
    { id: 'iphone', label: 'iPhone', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'macbook', label: 'MacBook', icon: <Laptop className="w-4 h-4" /> },
    { id: 'ipad', label: 'iPad', icon: <Tablet className="w-4 h-4" /> },
    { id: 'imac', label: 'iMac', icon: <Monitor className="w-4 h-4" /> },
    { id: 'watch', label: 'Watch', icon: <Watch className="w-4 h-4" /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Frame Style & Devices" position="center">
      <div className="flex flex-col h-[500px]">
        {/* Tabs */}
        <div className="flex border-b border-ui-border overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as FrameTab)}
                className={`flex-1 min-w-[80px] flex flex-col items-center justify-center gap-1.5 py-3 text-[10px] font-medium uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'text-white border-b-2 border-accent bg-ui-panel'
                    : 'text-ui-muted hover:text-ui-text hover:bg-ui-panel/30'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* Styles Tab */}
          {activeTab === 'styles' && (
            <div className="grid grid-cols-3 gap-3">
              {STYLE_PRESETS.map((preset) => {
                const isActive = stylePreset === preset.id && frameMode === 'basic';
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                        setStylePreset(preset.id as any);
                        setFrameMode('basic');
                    }}
                    className={`group relative aspect-square rounded-xl border overflow-hidden transition-all ${
                      isActive 
                         ? 'border-accent ring-2 ring-accent/30 scale-105 shadow-xl' 
                         : 'border-ui-border hover:border-accent/50 hover:scale-105'
                    }`}
                  >
                    <div
                      className="absolute inset-0 flex items-center justify-center p-3"
                      style={{
                        background: preset.css.background || 'linear-gradient(135deg, var(--color-ui-panel) 0%, var(--color-ui-bg) 100%)',
                      }}
                    >
                      <div
                        className="w-full h-2/3 rounded-lg bg-white/80 transition-transform group-hover:scale-110"
                        style={{ boxShadow: preset.css.boxShadow, border: preset.css.border }}
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <span className={`text-[10px] font-medium text-center block ${isActive ? 'text-accent' : 'text-white'}`}>
                        {preset.label}
                        </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Device Tabs */}
          {activeTab !== 'styles' && (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="p-6 rounded-full bg-ui-panel/50 border border-ui-border">
                   {activeTab === 'iphone' && <Smartphone className="w-12 h-12 text-accent" />}
                   {activeTab === 'macbook' && <Laptop className="w-12 h-12 text-accent" />}
                   {activeTab === 'ipad' && <Tablet className="w-12 h-12 text-accent" />}
                   {activeTab === 'imac' && <Monitor className="w-12 h-12 text-accent" />}
                   {activeTab === 'watch' && <Watch className="w-12 h-12 text-accent" />}
                </div>
                <div>
                   <h3 className="text-xl font-bold text-white mb-2">
                       {tabs.find(t => t.id === activeTab)?.label} Mockup Selected
                   </h3>
                   <p className="text-sm text-ui-muted max-w-xs mx-auto">
                       Your content will be automatically wrapped in a high-fidelity vector mockup of this device.
                   </p>
                </div>
                
                {/* Future: Add Color / Model variants here */}
                {/* For now, just a placeholder for variants */}
                <div className="mt-8 pt-6 border-t border-ui-border w-full">
                    <p className="text-[10px] text-ui-muted uppercase tracking-widest mb-3">Device Color (Coming Soon)</p>
                    <div className="flex justify-center gap-2">
                        {['#333', '#e3e3e3', '#f5f5f7', '#1d1d1f'].map(c => (
                            <div key={c} className="w-6 h-6 rounded-full border border-ui-border" style={{ backgroundColor: c }} />
                        ))}
                    </div>
                </div>
             </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-ui-border flex justify-between items-center bg-ui-panel/30">
          <div className="text-[10px] text-ui-muted">
             {frameMode === 'basic' ? `Style: ${stylePreset}` : `Device: ${deviceType}`}
          </div>
          <button
            onClick={onClose}
            className="h-9 px-6 bg-accent text-black text-sm font-bold rounded-lg hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
          >
            Apply
          </button>
        </div>
      </div>
    </Modal>
  );
};
