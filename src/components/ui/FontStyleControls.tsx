import { useEffect } from 'react';
import { Type, Palette, Sun } from 'lucide-react';
import { useRenderStore, type TextPosition } from '../../store/renderStore';
import { loadGoogleFont } from '../../hooks/useFontLoader';
import { SidebarHeader, ControlGroup } from './SidebarPrimitives';
import { SliderControl } from './SliderControl';
import { PositionPicker } from './PositionPicker';
import { FONT_OPTIONS } from '../../constants/ui';

export const FontStyleControls = () => {
  const { textOverlay, setTextOverlay } = useRenderStore();

  useEffect(() => {
    if (textOverlay.enabled && textOverlay.fontFamily) {
      loadGoogleFont(textOverlay.fontFamily);
    }
  }, [textOverlay.enabled, textOverlay.fontFamily]);

  if (!textOverlay.enabled) return null;

  return (
    <>
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

      {/* Text Shadow */}
      <div>
        <SidebarHeader icon={<Sun className="w-4 h-4" />}>Text Shadow</SidebarHeader>
        <ControlGroup>
          {/* Shadow Toggle */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-ui-muted">Enable Shadow</span>
            <button
              onClick={() => setTextOverlay({ shadowEnabled: !textOverlay.shadowEnabled })}
              className={`w-10 h-5 rounded-full transition-colors ${
                textOverlay.shadowEnabled ? 'bg-accent' : 'bg-ui-panel/50'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  textOverlay.shadowEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {textOverlay.shadowEnabled && (
            <>
              {/* Shadow Color */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-ui-muted">Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textOverlay.shadowColor}
                    onChange={(e) => setTextOverlay({ shadowColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-accent uppercase">
                    {textOverlay.shadowColor}
                  </span>
                </div>
              </div>

              {/* Shadow Blur */}
              <SliderControl
                label="Blur"
                icon={<Sun className="w-3.5 h-3.5" />}
                value={textOverlay.shadowBlur}
                min={0}
                max={20}
                unit="px"
                onChange={(v) => setTextOverlay({ shadowBlur: v })}
              />

              {/* Shadow Offset Y */}
              <SliderControl
                label="Offset Y"
                icon={<Sun className="w-3.5 h-3.5" />}
                value={textOverlay.shadowOffsetY}
                min={0}
                max={10}
                unit="px"
                onChange={(v) => setTextOverlay({ shadowOffsetY: v })}
              />

              {/* Shadow Opacity */}
              <SliderControl
                label="Opacity"
                icon={<Sun className="w-3.5 h-3.5" />}
                value={textOverlay.shadowOpacity}
                min={0}
                max={100}
                unit="%"
                onChange={(v) => setTextOverlay({ shadowOpacity: v })}
              />
            </>
          )}
        </ControlGroup>
      </div>

      {/* Text Position */}
      <div>
        <SidebarHeader icon={<Type className="w-4 h-4" />}>Text Position</SidebarHeader>
        <PositionPicker
          value={textOverlay.position}
          onChange={(pos) => setTextOverlay({ position: pos as TextPosition })}
          type="text"
          size="sm"
        />
      </div>
    </>
  );
};
