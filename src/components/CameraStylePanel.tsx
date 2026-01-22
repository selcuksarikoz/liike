import { useRef, useEffect, type ReactNode } from 'react';
import {
  ArrowUpDown,
  ArrowLeftRight,
  RotateCw,
  Maximize2,
  RectangleHorizontal,
  Palette,
  CloudFog,
  Contrast,
  RotateCcw,
  Box,
  Move3d,
  Sparkles,
  Square,
  RotateCcwIcon,
  ArrowDownToLine,
  Check,
} from 'lucide-react';
import { useRenderStore } from '../store/renderStore';
import { STYLE_PRESETS, SHADOW_TYPES } from '../constants/styles';
import { DURATIONS, EASINGS, STAGGER_DEFAULTS } from '../constants/animations';

const SliderControl = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  icon,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  icon?: ReactNode;
}) => {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fillRef.current) {
      const percent = ((value - min) / (max - min)) * 100;
      fillRef.current.animate(
        [{ width: `${percent}%` }],
        { duration: DURATIONS.fast, easing: EASINGS.easeOut, fill: 'forwards' }
      );
    }
  }, [value, min, max]);

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {icon && (
            <span className="text-ui-muted group-hover:text-accent transition-colors">
              {icon}
            </span>
          )}
          <span className="text-[10px] text-ui-muted group-hover:text-white transition-colors">{label}</span>
        </div>
        <span className="text-[10px] font-mono text-accent">
          {typeof value === 'number' && !Number.isInteger(step) ? value.toFixed(2) : value}{unit}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1.5 bg-ui-border rounded-full overflow-hidden">
          <div
            ref={fillRef}
            className="h-full bg-gradient-to-r from-accent/60 to-accent rounded-full"
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 w-full h-6 opacity-0 cursor-pointer"
        />
        <div
          className="absolute w-3 h-3 bg-accent rounded-full shadow-lg shadow-accent/30 pointer-events-none transition-transform group-hover:scale-125"
          style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 6px)` }}
        />
      </div>
    </div>
  );
};

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
    shadowBlur, setShadowBlur,
    shadowColor, setShadowColor,
  } = useRenderStore();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const sections = Array.from(containerRef.current.querySelectorAll('.style-section'));
      sections.forEach((section, i) => {
        (section as HTMLElement).animate(
          [
            { opacity: 0, transform: 'translateY(15px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ],
          {
            duration: DURATIONS.standard,
            easing: EASINGS.easeOut,
            fill: 'forwards',
            delay: i * STAGGER_DEFAULTS.cards * 2
          }
        );
      });
    }
  }, []);

  const handleReset = (section: string) => {
    if (containerRef.current) {
      containerRef.current.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(0.98)' },
          { transform: 'scale(1)' }
        ],
        { duration: DURATIONS.fast, easing: EASINGS.easeInOut }
      );
    }

    switch (section) {
      case 'rotation':
        setRotationX(0);
        setRotationY(0);
        setRotationZ(0);
        break;
      case 'transform':
        setDeviceScale(1);
        setCornerRadius(12);
        break;
      case 'shadow':
        setShadowType('spread');
        setShadowOpacity(40);
        break;
    }
  };

  const SectionHeader = ({ title, section, icon }: { title: string; section: string; icon: ReactNode }) => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-accent">{icon}</span>
        <h3 className="text-[10px] uppercase font-bold text-ui-muted tracking-widest">{title}</h3>
      </div>
      <button
        onClick={() => handleReset(section)}
        className="text-[9px] text-ui-muted hover:text-accent transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
      >
        <RotateCcw className="w-3 h-3" />
        Reset
      </button>
    </div>
  );

  return (
    <div ref={containerRef} className="p-4 space-y-5">
      {/* 3D Rotation */}
      <div className="style-section group">
        <SectionHeader title="3D Rotation" section="rotation" icon={<Box className="w-4 h-4" />} />
        <div className="space-y-3 bg-ui-panel/50 rounded-xl p-3">
          <SliderControl
            label="Tilt X"
            icon={<ArrowUpDown className="w-3.5 h-3.5" />}
            value={rotationX}
            min={-60}
            max={60}
            unit="°"
            onChange={setRotationX}
          />
          <SliderControl
            label="Tilt Y"
            icon={<ArrowLeftRight className="w-3.5 h-3.5" />}
            value={rotationY}
            min={-60}
            max={60}
            unit="°"
            onChange={setRotationY}
          />
          <SliderControl
            label="Rotate Z"
            icon={<RotateCw className="w-3.5 h-3.5" />}
            value={rotationZ}
            min={-45}
            max={45}
            unit="°"
            onChange={setRotationZ}
          />
        </div>
      </div>

      {/* Transform */}
      <div className="style-section group">
        <SectionHeader title="Transform" section="transform" icon={<Move3d className="w-4 h-4" />} />
        <div className="space-y-3 bg-ui-panel/50 rounded-xl p-3">
          <SliderControl
            label="Scale"
            icon={<Maximize2 className="w-3.5 h-3.5" />}
            value={deviceScale}
            min={0.5}
            max={1.5}
            step={0.05}
            unit="x"
            onChange={setDeviceScale}
          />
          <SliderControl
            label="Corner Radius"
            icon={<RectangleHorizontal className="w-3.5 h-3.5" />}
            value={cornerRadius}
            min={0}
            max={60}
            unit="px"
            onChange={setCornerRadius}
          />
        </div>
      </div>

      {/* Style Preset */}
      <div className="style-section">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-accent" />
          <h3 className="text-[10px] uppercase font-bold text-ui-muted tracking-widest">Frame Style</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {STYLE_PRESETS.map((preset) => {
            const isActive = stylePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setStylePreset(preset.id as typeof stylePreset)}
                className={`group relative aspect-square rounded-lg border overflow-hidden transition-all hover:scale-105 active:scale-95 ${
                  isActive ? 'border-accent ring-2 ring-accent/30' : 'border-ui-border hover:border-accent/50'
                }`}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center p-2"
                  style={{
                    background: preset.css.background || 'linear-gradient(135deg, var(--color-ui-panel) 0%, var(--color-ui-bg) 100%)',
                  }}
                >
                  <div
                    className="w-full h-2/3 rounded bg-white/80 transition-transform group-hover:scale-110"
                    style={{ boxShadow: preset.css.boxShadow, border: preset.css.border }}
                  />
                </div>
                <span className={`absolute bottom-0.5 inset-x-0 text-[7px] font-medium text-center transition-colors ${isActive ? 'text-accent' : 'text-white/60 group-hover:text-white'}`}>
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shadow */}
      {/* Shadow & Glow */}
      <div className="style-section group">
        <SectionHeader title="Shadow & Glow" section="shadow" icon={<CloudFog className="w-4 h-4" />} />
        
        {/* Shadow Presets */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {SHADOW_TYPES.map((type) => {
            const isActive = shadowType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => {
                  setShadowType(type.id);
                  // Apply preset values
                  if (type.id === 'none') {
                    setShadowOpacity(0);
                  } else if (type.id === 'soft') {
                    setShadowColor('#000000');
                    setShadowOpacity(40);
                    setShadowBlur(30);
                    setShadowSpread(0);
                    setShadowX(0);
                    setShadowY(20);
                  } else if (type.id === 'float') {
                    setShadowColor('#000000');
                    setShadowOpacity(50);
                    setShadowBlur(50);
                    setShadowSpread(-5);
                    setShadowX(0);
                    setShadowY(30);
                  } else if (type.id === 'dream') {
                    setShadowColor('#4f46e5');
                    setShadowOpacity(30);
                    setShadowBlur(60);
                    setShadowSpread(0);
                    setShadowX(0);
                    setShadowY(25);
                  } else if (type.id === 'glow') {
                    setShadowColor('#ffffff');
                    setShadowOpacity(50);
                    setShadowBlur(40);
                    setShadowSpread(5);
                    setShadowX(0);
                    setShadowY(0);
                  }
                }}
                className={`relative flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                  isActive ? 'bg-accent/10 border-accent' : 'border-ui-border hover:border-ui-muted bg-ui-panel/30'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <div
                    className="w-4 h-4 rounded-full bg-white/90 transition-transform"
                    style={{
                      boxShadow: type.id === 'none' ? 'none'
                        : type.id === 'soft' ? '0 4px 12px rgba(0,0,0,0.5)'
                        : type.id === 'float' ? '0 10px 25px rgba(0,0,0,0.6)'
                        : type.id === 'dream' ? '0 10px 20px rgba(80,80,255,0.4)'
                        : '0 0 10px rgba(255,255,255,0.8)'
                    }}
                  />
                </div>
                <span className={`text-[7px] font-medium transition-colors ${isActive ? 'text-accent' : 'text-ui-muted'}`}>
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Manual Controls */}
        {shadowType !== 'none' && (
          <div className="bg-ui-panel/50 rounded-xl p-3 space-y-3">
             <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-ui-muted" />
                  <span className="text-[10px] text-ui-muted">Color</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={shadowColor}
                    onChange={(e) => setShadowColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-none p-0 bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-accent uppercase">{shadowColor}</span>
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
          </div>
        )}
      </div>

      {/* Quick Presets */}
      <div className="style-section">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="text-[10px] uppercase font-bold text-ui-muted tracking-widest">Creative Angles</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Isometric', icon: <Box className="w-3.5 h-3.5" />, action: () => { setRotationX(30); setRotationY(-45); setRotationZ(0); setDeviceScale(0.85); } },
            { label: 'Floating', icon: <CloudFog className="w-3.5 h-3.5" />, action: () => { setRotationX(15); setRotationY(0); setRotationZ(-5); setDeviceScale(0.9); } },
            { label: 'Dynamic', icon: <Move3d className="w-3.5 h-3.5" />, action: () => { setRotationX(20); setRotationY(-30); setRotationZ(10); setDeviceScale(0.9); } },
            { label: 'Flat Lay', icon: <Square className="w-3.5 h-3.5" />, action: () => { setRotationX(0); setRotationY(0); setRotationZ(0); setDeviceScale(1); } },
            { label: 'Cinematic', icon: <Maximize2 className="w-3.5 h-3.5" />, action: () => { setRotationX(5); setRotationY(0); setRotationZ(0); setDeviceScale(1.1); } },
            { label: 'Phone', icon: <RectangleHorizontal className="w-3.5 h-3.5 rotate-90" />, action: () => { setRotationX(10); setRotationY(-10); setRotationZ(2); setDeviceScale(0.95); } },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                if (containerRef.current) {
                  const anim = containerRef.current.animate(
                    [
                      { opacity: 1 },
                      { opacity: 0.8 },
                      { opacity: 1 }
                    ],
                    { duration: 300, easing: 'ease-out' }
                  );
                }
                preset.action();
              }}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border border-ui-border bg-ui-panel/30 hover:bg-accent/10 hover:border-accent/50 transition-all hover:scale-105 active:scale-95 group"
            >
              <span className="text-ui-muted group-hover:text-accent transition-colors">{preset.icon}</span>
              <span className="text-[9px] font-medium text-ui-muted group-hover:text-white transition-colors">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
