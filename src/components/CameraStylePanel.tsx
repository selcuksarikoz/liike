import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useRenderStore } from '../store/renderStore';
import { STYLE_PRESETS, SHADOW_TYPES } from '../constants/styles';

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
  icon?: string;
}) => {
  const sliderRef = useRef<HTMLInputElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fillRef.current) {
      const percent = ((value - min) / (max - min)) * 100;
      gsap.to(fillRef.current, {
        width: `${percent}%`,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  }, [value, min, max]);

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {icon && (
            <span className="material-symbols-outlined text-[14px] text-ui-muted group-hover:text-accent transition-colors">
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
          ref={sliderRef}
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
  } = useRenderStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const sections = containerRef.current.querySelectorAll('.style-section');
      gsap.fromTo(
        sections,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, []);

  const handleReset = (section: string) => {
    gsap.to(containerRef.current, {
      scale: 0.98,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    });

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

  const SectionHeader = ({ title, section, icon }: { title: string; section: string; icon: string }) => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px] text-accent">{icon}</span>
        <h3 className="text-[10px] uppercase font-bold text-ui-muted tracking-widest">{title}</h3>
      </div>
      <button
        onClick={() => handleReset(section)}
        className="text-[9px] text-ui-muted hover:text-accent transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
      >
        <span className="material-symbols-outlined text-[12px]">restart_alt</span>
        Reset
      </button>
    </div>
  );

  return (
    <div ref={containerRef} className="p-4 space-y-5">
      {/* 3D Rotation */}
      <div className="style-section group">
        <SectionHeader title="3D Rotation" section="rotation" icon="3d_rotation" />
        <div className="space-y-3 bg-ui-panel/50 rounded-xl p-3">
          <SliderControl
            label="Tilt X"
            icon="swap_vert"
            value={rotationX}
            min={-60}
            max={60}
            unit="°"
            onChange={setRotationX}
          />
          <SliderControl
            label="Tilt Y"
            icon="swap_horiz"
            value={rotationY}
            min={-60}
            max={60}
            unit="°"
            onChange={setRotationY}
          />
          <SliderControl
            label="Rotate Z"
            icon="rotate_right"
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
        <SectionHeader title="Transform" section="transform" icon="transform" />
        <div className="space-y-3 bg-ui-panel/50 rounded-xl p-3">
          <SliderControl
            label="Scale"
            icon="zoom_out_map"
            value={deviceScale}
            min={0.5}
            max={1.5}
            step={0.05}
            unit="x"
            onChange={setDeviceScale}
          />
          <SliderControl
            label="Corner Radius"
            icon="rounded_corner"
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
          <span className="material-symbols-outlined text-[16px] text-accent">style</span>
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
      <div className="style-section group">
        <SectionHeader title="Shadow" section="shadow" icon="blur_on" />
        <div className="grid grid-cols-4 gap-2 mb-3">
          {SHADOW_TYPES.map((type) => {
            const isActive = shadowType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setShadowType(type.id)}
                className={`relative flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                  isActive ? 'bg-accent/10 border-accent' : 'border-ui-border hover:border-ui-muted bg-ui-panel/30'
                }`}
              >
                <div className="w-7 h-7 flex items-center justify-center">
                  <div
                    className="w-5 h-5 rounded bg-white/90 transition-transform"
                    style={{
                      boxShadow: type.id === 'none' ? 'none'
                        : type.id === 'spread' ? '-3px 6px 12px rgba(0,0,0,0.6)'
                        : type.id === 'hug' ? '0 3px 6px rgba(0,0,0,0.5)'
                        : '-2px 4px 8px rgba(0,0,0,0.5)'
                    }}
                  />
                </div>
                <span className={`text-[8px] font-medium transition-colors ${isActive ? 'text-accent' : 'text-ui-muted'}`}>
                  {type.label}
                </span>
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[10px] text-white">check</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {shadowType !== 'none' && (
          <div className="bg-ui-panel/50 rounded-xl p-3">
            <SliderControl
              label="Intensity"
              icon="tonality"
              value={shadowOpacity}
              min={0}
              max={100}
              unit="%"
              onChange={setShadowOpacity}
            />
          </div>
        )}
      </div>

      {/* Quick Presets */}
      <div className="style-section">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[16px] text-accent">auto_awesome</span>
          <h3 className="text-[10px] uppercase font-bold text-ui-muted tracking-widest">Quick Presets</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Flat', icon: 'crop_square', action: () => { setRotationX(0); setRotationY(0); setRotationZ(0); } },
            { label: 'Tilt Right', icon: 'rotate_right', action: () => { setRotationX(15); setRotationY(-20); setRotationZ(5); } },
            { label: 'Tilt Left', icon: 'rotate_left', action: () => { setRotationX(15); setRotationY(20); setRotationZ(-5); } },
            { label: 'Top View', icon: 'vertical_align_bottom', action: () => { setRotationX(35); setRotationY(0); setRotationZ(0); } },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                gsap.to(containerRef.current, {
                  scale: 0.98,
                  duration: 0.1,
                  yoyo: true,
                  repeat: 1,
                });
                preset.action();
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-ui-border bg-ui-panel/30 hover:bg-accent/10 hover:border-accent/50 transition-all hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] text-ui-muted">{preset.icon}</span>
              <span className="text-[10px] font-medium text-ui-text">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
