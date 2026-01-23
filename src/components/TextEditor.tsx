import { Type, X } from 'lucide-react';
import { useRenderStore } from '../store/renderStore';
import { loadGoogleFont } from '../hooks/useFontLoader';
import { SidebarHeader } from './ui/SidebarPrimitives';
import { FontStyleControls } from './ui/FontStyleControls';

export const TextEditor = () => {
  const { textOverlay, setTextOverlay, clearTextOverlay } = useRenderStore();

  if (!textOverlay.enabled) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Type className="w-8 h-8 text-ui-muted/30 mb-3" />
          <p className="text-sm text-ui-muted/60 mb-1">No Text Selected</p>
          <p className="text-xs text-ui-muted/40 mb-4">
            Select a text animation preset to add text
          </p>
          <button
            onClick={() => {
              loadGoogleFont('Manrope');
              setTextOverlay({ enabled: true });
            }}
            className="px-4 py-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors text-sm font-medium"
          >
            + Add Text
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Text Content */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <SidebarHeader icon={<Type className="w-4 h-4" />}>Text Content</SidebarHeader>
          <button
            onClick={clearTextOverlay}
            className="p-1 rounded hover:bg-ui-panel/50 text-ui-muted hover:text-red-400 transition-colors"
            title="Remove text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-ui-muted mb-1 block">Headline</label>
            <input
              type="text"
              value={textOverlay.headline}
              onChange={(e) => setTextOverlay({ headline: e.target.value })}
              placeholder="Main headline..."
              className="w-full px-3 py-2 rounded-lg bg-ui-panel/50 border border-ui-border focus:border-accent focus:outline-none text-white text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-ui-muted mb-1 block">Tagline</label>
            <input
              type="text"
              value={textOverlay.tagline}
              onChange={(e) => setTextOverlay({ tagline: e.target.value })}
              placeholder="Subtitle or tagline..."
              className="w-full px-3 py-2 rounded-lg bg-ui-panel/50 border border-ui-border focus:border-accent focus:outline-none text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Font & Style, Text Shadow, Position */}
      <FontStyleControls />
    </div>
  );
};
