import { useEffect } from 'react';
import { Type, Palette, X, Move } from 'lucide-react';
import { useRenderStore, type TextPosition } from '../store/renderStore';
import { loadGoogleFont } from '../hooks/useFontLoader';
import { SidebarHeader, ControlGroup } from './ui/SidebarPrimitives';
import { SliderControl } from './ui/SliderControl';
import { PositionPicker } from './ui/PositionPicker';
import { FONT_OPTIONS } from '../constants/ui';

export const TextEditor = () => {
  const { textOverlay, setTextOverlay, clearTextOverlay } = useRenderStore();

  // Preload font when text is enabled
  useEffect(() => {
    if (textOverlay.enabled && textOverlay.fontFamily) {
      loadGoogleFont(textOverlay.fontFamily);
    }
  }, [textOverlay.enabled, textOverlay.fontFamily]);

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
        <div className="flex items-center justify-between mb-2">
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

      {/* Font & Style */}
      <div>
        <SidebarHeader icon={<Palette className="w-4 h-4" />}>Font & Style</SidebarHeader>
        <ControlGroup>
          {/* Font Family */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-ui-muted">Font</span>
            <select
              value={textOverlay.fontFamily}
              onChange={(e) => {
                const font = e.target.value;
                loadGoogleFont(font);
                setTextOverlay({ fontFamily: font });
              }}
              className="px-2 py-1 rounded bg-ui-panel/50 border border-ui-border text-white text-xs focus:outline-none focus:border-accent max-w-[140px]"
            >
              <optgroup label="Sans-Serif">
                {FONT_OPTIONS.filter((f) => f.category === 'sans').map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Serif">
                {FONT_OPTIONS.filter((f) => f.category === 'serif').map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Display">
                {FONT_OPTIONS.filter((f) => f.category === 'display').map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Monospace">
                {FONT_OPTIONS.filter((f) => f.category === 'mono').map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Color */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-ui-muted">Color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textOverlay.color}
                onChange={(e) => setTextOverlay({ color: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent"
              />
              <span className="text-[10px] font-mono text-accent uppercase">
                {textOverlay.color}
              </span>
            </div>
          </div>

          {/* Headline Font Size */}
          <SliderControl
            label="Headline Size"
            icon={<Type className="w-3.5 h-3.5" />}
            value={textOverlay.fontSize}
            min={24}
            max={120}
            unit="px"
            onChange={(v) => setTextOverlay({ fontSize: v })}
          />

          {/* Tagline Font Size */}
          <SliderControl
            label="Tagline Size"
            icon={<Type className="w-3.5 h-3.5" />}
            value={textOverlay.taglineFontSize}
            min={12}
            max={48}
            unit="px"
            onChange={(v) => setTextOverlay({ taglineFontSize: v })}
          />

          {/* Font Weight */}
          <SliderControl
            label="Weight"
            icon={<Type className="w-3.5 h-3.5" />}
            value={textOverlay.fontWeight}
            min={100}
            max={900}
            step={100}
            unit=""
            onChange={(v) => setTextOverlay({ fontWeight: v })}
          />
        </ControlGroup>
      </div>

      {/* Text Position */}
      <div>
        <SidebarHeader icon={<Move className="w-4 h-4" />}>Text Position</SidebarHeader>
        <PositionPicker
          value={textOverlay.position}
          onChange={(pos) => setTextOverlay({ position: pos as TextPosition })}
          type="text"
          size="sm"
        />
      </div>
    </div>
  );
};
