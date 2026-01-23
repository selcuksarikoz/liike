import { useEffect } from 'react';
import { Type, Palette, X, Move, Monitor } from 'lucide-react';
import { useRenderStore, type TextPosition, type DevicePosition } from '../store/renderStore';
import { loadGoogleFont } from '../hooks/useFontLoader';
import { SidebarHeader, ControlGroup } from './ui/SidebarPrimitives';
import { SliderControl } from './ui/SliderControl';
import { FONT_OPTIONS } from '../constants/ui';

// 9-position grid for text placement
const POSITION_GRID: { position: TextPosition; label: string }[] = [
  { position: 'top-left', label: 'TL' },
  { position: 'top-center', label: 'TC' },
  { position: 'top-right', label: 'TR' },
  { position: 'center-left', label: 'CL' },
  { position: 'center', label: 'C' },
  { position: 'center-right', label: 'CR' },
  { position: 'bottom-left', label: 'BL' },
  { position: 'bottom-center', label: 'BC' },
  { position: 'bottom-right', label: 'BR' },
];

// 9-position grid for device placement
const DEVICE_POSITION_GRID: { position: DevicePosition; label: string }[] = [
  { position: 'top-left', label: 'TL' },
  { position: 'top', label: 'T' },
  { position: 'top-right', label: 'TR' },
  { position: 'left', label: 'L' },
  { position: 'center', label: 'C' },
  { position: 'right', label: 'R' },
  { position: 'bottom-left', label: 'BL' },
  { position: 'bottom', label: 'B' },
  { position: 'bottom-right', label: 'BR' },
];

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

      {/* Text Position Grid */}
      <div>
        <SidebarHeader icon={<Move className="w-4 h-4" />}>Text Position</SidebarHeader>
        <div className="grid grid-cols-3 gap-1.5 p-3 bg-ui-panel/30 rounded-lg border border-ui-border/50">
          {POSITION_GRID.map(({ position, label }) => {
            const isActive = textOverlay.position === position;
            return (
              <button
                key={position}
                onClick={() => setTextOverlay({ position })}
                className={`relative aspect-square rounded-md border transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-accent border-accent'
                    : 'bg-ui-panel/50 border-ui-border hover:border-accent/50 hover:bg-ui-panel'
                }`}
                title={position}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    isActive ? 'bg-black scale-110' : 'bg-ui-muted/40'
                  }`}
                />
                <span className="sr-only">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Device Position Grid */}
      <div>
        <SidebarHeader icon={<Monitor className="w-4 h-4" />}>Device Position</SidebarHeader>
        <div className="grid grid-cols-3 gap-1.5 p-3 bg-ui-panel/30 rounded-lg border border-ui-border/50">
          {DEVICE_POSITION_GRID.map(({ position, label }) => {
            const isActive = textOverlay.devicePosition === position;
            return (
              <button
                key={position}
                onClick={() => setTextOverlay({ devicePosition: position })}
                className={`relative aspect-square rounded-md border transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-violet-500 border-violet-500'
                    : 'bg-ui-panel/50 border-ui-border hover:border-violet-500/50 hover:bg-ui-panel'
                }`}
                title={position}
              >
                <Monitor
                  className={`w-3 h-3 transition-all duration-200 ${
                    isActive ? 'text-white scale-110' : 'text-ui-muted/40'
                  }`}
                />
                <span className="sr-only">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Animate In Toggle */}
        <div className="flex items-center justify-between mt-3 px-1">
          <span className="text-[10px] text-ui-muted">Animate device in</span>
          <button
            onClick={() => setTextOverlay({ deviceAnimateIn: !textOverlay.deviceAnimateIn })}
            className={`w-10 h-5 rounded-full transition-all duration-200 ${
              textOverlay.deviceAnimateIn ? 'bg-violet-500' : 'bg-ui-panel/50 border border-ui-border'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                textOverlay.deviceAnimateIn ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
