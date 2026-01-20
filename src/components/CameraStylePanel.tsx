import { useRenderStore } from '../store/renderStore';
import { STYLE_PRESETS, SHADOW_TYPES } from '../constants/styles';

export const CameraStylePanel = () => {
  const {
    rotationX, setRotationX,
    rotationY, setRotationY,
    rotationZ, setRotationZ,
    cornerRadius, setCornerRadius,
    deviceScale, setDeviceScale,
    stylePreset, setStylePreset,
    shadowType, setShadowType,
    shadowOpacity, setShadowOpacity,
  } = useRenderStore();

  return (
    <div className="p-4 space-y-5">
      {/* 3D Rotation */}
      <div className="space-y-3">
        <h3 className="text-[10px] uppercase font-bold text-ui-muted tracking-widest">Rotation</h3>
        <div className="space-y-2">
          {[
            { label: 'X', value: rotationX, setter: setRotationX, min: -60, max: 60 },
            { label: 'Y', value: rotationY, setter: setRotationY, min: -60, max: 60 },
            { label: 'Z', value: rotationZ, setter: setRotationZ, min: -45, max: 45 },
          ].map(({ label, value, setter, min, max }) => (
            <label key={label} className="flex items-center gap-3">
              <span className="text-[10px] text-ui-muted w-4">{label}</span>
              <input
                type="range" min={min} max={max} value={value}
                onChange={(e) => setter(Number(e.target.value))}
                className="flex-1 accent-accent h-1 bg-ui-border rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] font-mono text-accent w-8 text-right">{value}°</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-ui-border" />

      {/* Transform */}
      <div className="space-y-3">
        <h3 className="text-[10px] uppercase font-bold text-ui-muted tracking-widest">Transform</h3>
        <label className="flex items-center gap-3">
          <span className="text-[10px] text-ui-muted w-12">Scale</span>
          <input
            type="range" min="0.5" max="1.5" step="0.05" value={deviceScale}
            onChange={(e) => setDeviceScale(Number(e.target.value))}
            className="flex-1 accent-accent h-1 bg-ui-border rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] font-mono text-accent w-10 text-right">{deviceScale.toFixed(2)}x</span>
        </label>
        <label className="flex items-center gap-3">
          <span className="text-[10px] text-ui-muted w-12">Radius</span>
          <input
            type="range" min="0" max="60" value={cornerRadius}
            onChange={(e) => setCornerRadius(Number(e.target.value))}
            className="flex-1 accent-accent h-1 bg-ui-border rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] font-mono text-accent w-10 text-right">{cornerRadius}px</span>
        </label>
      </div>

      <div className="h-px bg-ui-border" />

      {/* Style */}
      <div>
        <h3 className="text-[10px] uppercase font-bold text-ui-muted tracking-widest mb-3">Style</h3>
        <div className="grid grid-cols-4 gap-2">
          {STYLE_PRESETS.map((preset) => {
            const isActive = stylePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setStylePreset(preset.id as typeof stylePreset)}
                className={`group relative aspect-square rounded-lg border overflow-hidden transition-all hover:scale-105 ${
                  isActive ? 'border-accent ring-1 ring-accent/50' : 'border-ui-border hover:border-accent/50'
                }`}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center p-2"
                  style={{
                    background: preset.css.background || 'linear-gradient(135deg, #333 0%, #222 100%)',
                  }}
                >
                  <div
                    className="w-full h-2/3 rounded bg-white/80"
                    style={{ boxShadow: preset.css.boxShadow, border: preset.css.border }}
                  />
                </div>
                <span className={`absolute bottom-0.5 inset-x-0 text-[7px] font-medium text-center ${isActive ? 'text-accent' : 'text-white/60'}`}>
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-ui-border" />

      {/* Shadow */}
      <div>
        <h3 className="text-[10px] uppercase font-bold text-ui-muted tracking-widest mb-3">Shadow</h3>
        <div className="grid grid-cols-4 gap-2">
          {SHADOW_TYPES.map((type) => {
            const isActive = shadowType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setShadowType(type.id)}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition-all ${
                  isActive ? 'bg-ui-panel border-accent' : 'border-ui-border hover:border-ui-muted'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <div
                    className="w-5 h-5 rounded bg-white/90"
                    style={{
                      boxShadow: type.id === 'none' ? 'none'
                        : type.id === 'spread' ? '-2px 4px 8px rgba(0,0,0,0.5)'
                        : type.id === 'hug' ? '0 2px 4px rgba(0,0,0,0.5)'
                        : '-1px 3px 6px rgba(0,0,0,0.5)'
                    }}
                  />
                </div>
                <span className={`text-[8px] font-medium ${isActive ? 'text-accent' : 'text-ui-muted'}`}>
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>
        {shadowType !== 'none' && (
          <label className="flex items-center gap-3 mt-3">
            <span className="text-[10px] text-ui-muted w-12">Opacity</span>
            <input
              type="range" min="0" max="100" value={shadowOpacity}
              onChange={(e) => setShadowOpacity(Number(e.target.value))}
              className="flex-1 h-1 bg-ui-border rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <span className="text-[10px] font-mono text-accent w-8 text-right">{shadowOpacity}%</span>
          </label>
        )}
      </div>
    </div>
  );
};
