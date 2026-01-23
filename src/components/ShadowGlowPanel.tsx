import { CloudFog, Contrast, Palette, RotateCcw, MoveHorizontal, MoveVertical } from 'lucide-react';
import { useRenderStore } from '../store/renderStore';
import { SHADOW_TYPES } from '../constants/styles';
import { SliderControl } from './ui/SliderControl';
import { SidebarHeader, ControlGroup } from './ui/SidebarPrimitives';

export const ShadowGlowPanel = () => {
  const {
    shadowType,
    setShadowType,
    shadowOpacity,
    setShadowOpacity,
    shadowBlur,
    setShadowBlur,
    shadowColor,
    setShadowColor,
    shadowX,
    setShadowX,
    shadowY,
    setShadowY,
  } = useRenderStore();

  const handleReset = () => {
    setShadowType('soft');
    setShadowColor('#000000');
    setShadowOpacity(40);
    setShadowBlur(30);
    setShadowX(0);
    setShadowY(20);
  };

  const applyPreset = (presetId: string) => {
    setShadowType(presetId as typeof shadowType);

    switch (presetId) {
      case 'none':
        setShadowOpacity(0);
        break;
      case 'soft':
        setShadowColor('#000000');
        setShadowOpacity(40);
        setShadowBlur(30);
        setShadowX(0);
        setShadowY(20);
        break;
      case 'float':
        setShadowColor('#000000');
        setShadowOpacity(50);
        setShadowBlur(50);
        setShadowX(0);
        setShadowY(30);
        break;
      case 'dream':
        setShadowColor('#4f46e5');
        setShadowOpacity(30);
        setShadowBlur(60);
        setShadowX(0);
        setShadowY(25);
        break;
      case 'glow':
        setShadowColor('#ffffff');
        setShadowOpacity(50);
        setShadowBlur(40);
        setShadowX(0);
        setShadowY(0);
        break;
    }
  };

  return (
    <div className="style-section group">
      <SidebarHeader
        icon={<CloudFog className="w-4 h-4" />}
        action={
          <button
            onClick={handleReset}
            className="text-[9px] text-ui-muted hover:text-accent transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        }
      >
        Shadow & Glow
      </SidebarHeader>

      {/* Shadow Presets */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {SHADOW_TYPES.map((type) => {
          const isActive = shadowType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => applyPreset(type.id)}
              className={`relative flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                isActive
                  ? 'bg-accent/10 border-accent'
                  : 'border-ui-border hover:border-ui-muted bg-ui-panel/30'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <div
                  className="w-4 h-4 rounded-full bg-white/90 transition-transform"
                  style={{
                    boxShadow:
                      type.id === 'none'
                        ? 'none'
                        : type.id === 'soft'
                          ? '0 4px 12px rgba(0,0,0,0.5)'
                          : type.id === 'float'
                            ? '0 10px 25px rgba(0,0,0,0.6)'
                            : type.id === 'dream'
                              ? '0 10px 20px rgba(80,80,255,0.4)'
                              : '0 0 10px 2px rgba(255,255,255,0.8)',
                  }}
                />
              </div>
              <span
                className={`text-[7px] font-medium transition-colors ${isActive ? 'text-accent' : 'text-ui-muted'}`}
              >
                {type.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Manual Controls */}
      {shadowType !== 'none' && (
        <ControlGroup>
          {/* Color Picker */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-ui-muted" />
              <span className="text-[10px] text-ui-muted">Color</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={shadowColor}
                onChange={(e) => setShadowColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border border-ui-border p-0 bg-transparent"
              />
              <span className="text-[10px] font-mono text-accent uppercase w-14">{shadowColor}</span>
            </div>
          </div>

          <SliderControl
            label="Opacity"
            icon={<Contrast className="w-3.5 h-3.5" />}
            value={shadowOpacity}
            min={0}
            max={100}
            unit="%"
            onChange={setShadowOpacity}
          />

          <SliderControl
            label="Blur"
            icon={<CloudFog className="w-3.5 h-3.5" />}
            value={shadowBlur}
            min={0}
            max={200}
            unit="px"
            onChange={setShadowBlur}
          />

          <SliderControl
            label="Offset X"
            icon={<MoveHorizontal className="w-3.5 h-3.5" />}
            value={shadowX}
            min={-100}
            max={100}
            unit="px"
            onChange={setShadowX}
          />

          <SliderControl
            label="Offset Y"
            icon={<MoveVertical className="w-3.5 h-3.5" />}
            value={shadowY}
            min={-100}
            max={100}
            unit="px"
            onChange={setShadowY}
          />
        </ControlGroup>
      )}
    </div>
  );
};
