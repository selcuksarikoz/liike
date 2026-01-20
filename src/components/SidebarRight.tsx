import { useState } from 'react';
import { CameraStylePanel } from './CameraStylePanel';
import { LayoutsPanel } from './LayoutsPanel';
import { BackgroundModal } from './BackgroundModal';
import { useRenderStore } from '../store/renderStore';

export const SidebarRight = () => {
  const [activeTab, setActiveTab] = useState<'layouts' | 'style'>('layouts');
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);

  const { backgroundType, backgroundGradient, backgroundColor, backgroundImage } = useRenderStore();

  // Generate preview style for background button
  const getBackgroundPreviewStyle = () => {
    switch (backgroundType) {
      case 'solid':
        return { backgroundColor };
      case 'image':
        return backgroundImage
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : {};
      case 'gradient':
      default:
        return {};
    }
  };

  // Get gradient class for preview
  const getGradientClass = () => {
    if (backgroundType === 'gradient') {
      return `bg-gradient-to-br ${backgroundGradient}`;
    }
    return '';
  };

  return (
    <aside className="flex w-80 flex-col border-l border-ui-border bg-ui-bg-secondary h-full overflow-hidden">
      {/* Background Button */}
      <div className="p-3 border-b border-ui-border">
        <button
          onClick={() => setIsBackgroundModalOpen(true)}
          className="w-full flex items-center gap-3 p-2 rounded-xl border border-ui-border hover:border-accent/50 hover:bg-ui-panel/50 transition-all group"
        >
          <div
            className={`w-10 h-10 rounded-lg border border-ui-border overflow-hidden flex-shrink-0 ${getGradientClass()}`}
            style={getBackgroundPreviewStyle()}
          />
          <div className="flex-1 text-left">
            <div className="text-[11px] font-medium text-white">Background</div>
            <div className="text-[9px] text-ui-muted capitalize">{backgroundType}</div>
          </div>
          <span className="material-symbols-outlined text-[18px] text-ui-muted group-hover:text-accent transition-colors">
            chevron_right
          </span>
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-ui-border">
        <button
          onClick={() => setActiveTab('layouts')}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${
            activeTab === 'layouts'
              ? 'text-white border-b-2 border-accent bg-ui-panel'
              : 'text-ui-muted hover:text-ui-text'
          }`}
        >
          Layouts
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${
            activeTab === 'style'
              ? 'text-white border-b-2 border-accent bg-ui-panel'
              : 'text-ui-muted hover:text-ui-text'
          }`}
        >
          Style
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'layouts' && <LayoutsPanel />}
        {activeTab === 'style' && <CameraStylePanel />}
      </div>

      {/* Background Modal */}
      <BackgroundModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
      />
    </aside>
  );
};
