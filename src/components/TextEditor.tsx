import { Type, Palette, AlignCenter, Sparkles, X } from 'lucide-react';
import { useRenderStore } from '../store/renderStore';
import type { TextOverlay } from '../store/renderStore';
import { SidebarHeader, ControlGroup } from './ui/SidebarPrimitives';
import { SliderControl } from './ui/SliderControl';
import { TEXT_ANIMATIONS } from '../constants/textAnimations';
import { FONT_OPTIONS, TEXT_POSITION_OPTIONS } from '../constants/ui';

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
            onClick={() => setTextOverlay({ enabled: true })}
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
        <textarea
          value={textOverlay.text}
          onChange={(e) => setTextOverlay({ text: e.target.value })}
          placeholder="Enter your text..."
          className="w-full px-3 py-2 rounded-lg bg-ui-panel/50 border border-ui-border focus:border-accent focus:outline-none text-white text-sm resize-none"
          rows={3}
        />
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
              onChange={(e) => setTextOverlay({ fontFamily: e.target.value })}
              className="px-2 py-1 rounded bg-ui-panel/50 border border-ui-border text-white text-xs focus:outline-none focus:border-accent"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
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

          {/* Font Size */}
          <SliderControl
            label="Size"
            icon={<Type className="w-3.5 h-3.5" />}
            value={textOverlay.fontSize}
            min={12}
            max={120}
            unit="px"
            onChange={(v) => setTextOverlay({ fontSize: v })}
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

      {/* Position */}
      <div>
        <SidebarHeader icon={<AlignCenter className="w-4 h-4" />}>Position</SidebarHeader>
        <div className="grid grid-cols-3 gap-2">
          {TEXT_POSITION_OPTIONS.map((pos) => {
            const isActive = textOverlay.position === pos.value;
            return (
              <button
                key={pos.value}
                onClick={() => setTextOverlay({ position: pos.value })}
                className={`py-2 rounded-lg border text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'border-ui-border hover:border-ui-muted text-ui-muted hover:text-white'
                }`}
              >
                {pos.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Animation */}
      <div>
        <SidebarHeader icon={<Sparkles className="w-4 h-4" />}>Animation</SidebarHeader>
        <div className="grid grid-cols-3 gap-2">
          {TEXT_ANIMATIONS.slice(0, 9).map((anim) => {
            const isActive = textOverlay.animation === anim.id;
            return (
              <button
                key={anim.id}
                onClick={() => setTextOverlay({ animation: anim.id })}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition-all ${
                  isActive ? 'bg-accent/20 border-accent' : 'border-ui-border hover:border-ui-muted'
                }`}
                title={anim.description}
              >
                <span className="text-base">{anim.icon}</span>
                <span
                  className={`text-[8px] font-medium ${isActive ? 'text-accent' : 'text-ui-muted'}`}
                >
                  {anim.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
