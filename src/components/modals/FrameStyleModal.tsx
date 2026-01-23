import { useState } from 'react';
import { Palette, Smartphone, Laptop, Tablet, Watch, Monitor } from 'lucide-react';
import { useRenderStore } from '../../store/renderStore';
import { STYLE_PRESETS } from '../../constants/styles';
import { DEVICES } from '../../constants/devices';
import { Modal } from './Modal';

type FrameTab = 'styles' | 'iphone' | 'macbook' | 'ipad' | 'imac' | 'watch';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const FrameStyleModal = ({ isOpen, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<FrameTab>('styles');
  const { stylePreset, setStylePreset, frameMode, setFrameMode, deviceType, setDeviceType } =
    useRenderStore();

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
      <div className="flex flex-col h-[600px]">
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
        <div className="flex-1 overflow-y-auto p-4">
          {/* Styles Tab */}
          {activeTab === 'styles' && (
            <div className="grid grid-cols-4 gap-2">
              {STYLE_PRESETS.map((preset) => {
                const isActive = stylePreset === preset.id && frameMode === 'basic';
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setStylePreset(preset.id as any);
                      setFrameMode('basic');
                    }}
                    className={`group relative aspect-square rounded-lg border overflow-hidden transition-all text-left ${
                      isActive
                        ? 'border-accent ring-1 ring-accent/30'
                        : 'border-ui-border hover:border-accent/50'
                    }`}
                  >
                    <div
                      className="absolute inset-0 flex items-center justify-center p-2"
                      style={{
                        background:
                          preset.css.background ||
                          'linear-gradient(135deg, var(--color-ui-panel) 0%, var(--color-ui-bg) 100%)',
                      }}
                    >
                      <div
                        className="w-full h-1/2 rounded bg-white/80"
                        style={{ boxShadow: preset.css.boxShadow, border: preset.css.border }}
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                      <span
                        className={`text-[9px] font-medium block truncate ${isActive ? 'text-accent' : 'text-white'}`}
                      >
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
            <div className="grid grid-cols-4 gap-2">
              {DEVICES.filter((d) => {
                if (activeTab === 'iphone') return d.type === 'phone';
                if (activeTab === 'macbook') return d.type === 'laptop';
                if (activeTab === 'ipad') return d.type === 'tablet';
                if (activeTab === 'imac') return d.type === 'desktop';
                if (activeTab === 'watch') return d.type === 'watch';
                return false;
              }).map((device) => {
                const isActive = deviceType === device.id && frameMode === 'device';
                return (
                  <button
                    key={device.id}
                    onClick={() => {
                      setFrameMode('device');
                      setDeviceType(device.id);
                    }}
                    className={`group relative aspect-[3/4] rounded-lg border overflow-hidden transition-all bg-ui-panel/30 ${
                      isActive
                        ? 'border-accent ring-1 ring-accent/30'
                        : 'border-ui-border hover:border-accent/50'
                    }`}
                  >
                    <div className="absolute inset-0 p-2 flex items-center justify-center">
                      <img
                        src={device.image}
                        alt={device.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                      <span
                        className={`text-[9px] font-medium leading-tight block text-center ${isActive ? 'text-accent' : 'text-white'}`}
                      >
                        {device.name}
                      </span>
                    </div>
                  </button>
                );
              })}
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
