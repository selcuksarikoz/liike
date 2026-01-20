import { Modal } from './Modal';
import { useRenderStore } from '../../store/renderStore';
import { STYLE_PRESETS, BORDER_TYPES, SHADOW_TYPES } from '../../constants/styles';

type StyleOptionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const StyleOptionsModal = ({ isOpen, onClose }: StyleOptionsModalProps) => {
  const {
    stylePreset, setStylePreset,
    borderType, setBorderType,
    borderRadius, setBorderRadius,
    shadowType, setShadowType,
    shadowOpacity, setShadowOpacity,
  } = useRenderStore();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Style Options" position="center">
      <div className="p-5 space-y-6">

        {/* Style Section */}
        <div>
          <h3 className="text-[10px] uppercase font-bold text-ui-muted tracking-widest mb-3">Style</h3>
          <div className="grid grid-cols-4 gap-2">
            {STYLE_PRESETS.map((preset) => {
              const isActive = stylePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setStylePreset(preset.id as typeof stylePreset)}
                  className={`group relative aspect-square rounded-xl border overflow-hidden transition-all hover:scale-[1.02] ${
                    isActive
                      ? 'border-accent ring-2 ring-accent/30'
                      : 'border-ui-border hover:border-accent/50'
                  }`}
                >
                  {/* Preview Background */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background: preset.css.background || 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)',
                      ...preset.css
                    }}
                  >
                    <div
                      className="w-3/4 h-1/2 rounded-lg bg-white/80"
                      style={{
                        boxShadow: preset.css.boxShadow,
                        border: preset.css.border,
                      }}
                    />
                  </div>

                  {/* Label */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <span className={`text-[9px] font-medium ${isActive ? 'text-accent' : 'text-white/80'}`}>
                      {preset.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-ui-border" />

        {/* Border Section */}
        <div>
          <h3 className="text-[10px] uppercase font-bold text-ui-muted tracking-widest mb-3">Border</h3>
          <div className="flex gap-2 mb-4">
            {BORDER_TYPES.map((type) => {
              const isActive = borderType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setBorderType(type.id);
                    setBorderRadius(type.radius);
                  }}
                  className={`flex-1 flex flex-col items-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-ui-panel border-accent'
                      : 'border-ui-border hover:border-ui-muted'
                  }`}
                >
                  {/* Corner Preview */}
                  <div className="w-8 h-8 relative">
                    <div
                      className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 ${isActive ? 'border-accent' : 'border-white/60'}`}
                      style={{ borderRadius: `0 ${type.radius}px 0 0` }}
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-accent' : 'text-ui-muted'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Radius Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-ui-muted min-w-[50px]">Radius</span>
            <input
              type="range"
              min="0"
              max="100"
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="flex-1 h-1 bg-ui-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
              style={{
                backgroundImage: `linear-gradient(to right, #d4ff3f 0%, #d4ff3f ${borderRadius}%, #2c393f ${borderRadius}%, #2c393f 100%)`
              }}
            />
            <span className="text-xs font-mono text-accent min-w-[32px] text-right">{borderRadius}</span>
          </div>
        </div>

        <div className="h-px bg-ui-border" />

        {/* Shadow Section */}
        <div>
          <h3 className="text-[10px] uppercase font-bold text-ui-muted tracking-widest mb-3">Shadow</h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {SHADOW_TYPES.map((type) => {
              const isActive = shadowType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setShadowType(type.id)}
                  className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-ui-panel border-accent'
                      : 'border-ui-border hover:border-ui-muted'
                  }`}
                >
                  {/* Shadow Preview */}
                  <div className="w-10 h-10 relative flex items-center justify-center">
                    <div
                      className="w-8 h-8 rounded-lg bg-white/90"
                      style={{
                        boxShadow: type.id === 'none'
                          ? 'none'
                          : type.id === 'spread'
                            ? '-4px 8px 16px rgba(0,0,0,0.4)'
                            : type.id === 'hug'
                              ? '0 4px 8px rgba(0,0,0,0.4)'
                              : '-2px 6px 12px rgba(0,0,0,0.4)'
                      }}
                    />
                  </div>
                  <span className={`text-[9px] font-medium ${isActive ? 'text-accent' : 'text-ui-muted'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Opacity Slider */}
          {shadowType !== 'none' && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-ui-muted min-w-[50px]">Opacity</span>
              <input
                type="range"
                min="0"
                max="100"
                value={shadowOpacity}
                onChange={(e) => setShadowOpacity(Number(e.target.value))}
                className="flex-1 h-1 bg-ui-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(to right, #d4ff3f 0%, #d4ff3f ${shadowOpacity}%, #2c393f ${shadowOpacity}%, #2c393f 100%)`
                }}
              />
              <span className="text-xs font-mono text-accent min-w-[32px] text-right">{shadowOpacity}</span>
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
};
