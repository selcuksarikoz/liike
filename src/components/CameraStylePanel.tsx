import { useRef, useEffect, useState } from 'react';
import {
  ArrowUpDown,
  ArrowLeftRight,
  RotateCw,
  Maximize2,
  Palette,
  CloudFog,
  Contrast,
  RotateCcw,
  Box,
  Move3d,
  Square,
} from 'lucide-react';
import { useRenderStore } from '../store/renderStore';
import { SHADOW_TYPES } from '../constants/styles';
import { DURATIONS, EASINGS, STAGGER_DEFAULTS } from '../constants/animations';
import { FrameStyleModal } from './modals/FrameStyleModal';

import { DropdownTrigger } from './ui/Dropdown';
import { SliderControl } from './ui/SliderControl';
import { SidebarHeader, ControlGroup } from './ui/SidebarPrimitives';
import { LayoutPicker } from './LayoutPicker';
import { CreativeAngles } from './CreativeAngles';

export const CameraStylePanel = () => {
  const {
    rotationX,
    setRotationX,
    rotationY,
    setRotationY,
    rotationZ,
    setRotationZ,
    cornerRadius,
    setCornerRadius,
    deviceScale,
    setDeviceScale,
    stylePreset,
    shadowType,
    setShadowType,
    shadowOpacity,
    setShadowOpacity,
    shadowBlur,
    setShadowBlur,
    shadowColor,
    setShadowColor,
    setShadowSpread,
    setShadowX,
    setShadowY,

    frameMode,
    deviceType,
  } = useRenderStore();

  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to format values
  const getFormattedValue = () => {
    if (frameMode === 'device') {
      if (deviceType === 'imac') return 'iMac';
      if (deviceType === 'iphone') return 'iPhone';
      if (deviceType === 'ipad') return 'iPad';
      return deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
    }
    // Format style preset (e.g. soft-gradient -> Soft Gradient)
    return stylePreset
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');
  };

  useEffect(() => {
    if (containerRef.current) {
      const sections = Array.from(containerRef.current.querySelectorAll('.style-section'));
      sections.forEach((section, i) => {
        (section as HTMLElement).animate(
          [
            { opacity: 0, transform: 'translateY(15px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          {
            duration: DURATIONS.standard,
            easing: EASINGS.easeOut,
            fill: 'forwards',
            delay: i * STAGGER_DEFAULTS.cards * 2,
          }
        );
      });
    }
  }, []);

  const handleReset = (section: string) => {
    if (containerRef.current) {
      containerRef.current.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(0.98)' }, { transform: 'scale(1)' }],
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
        setShadowType('soft');
        setShadowOpacity(40);
        break;
    }
  };

  const ResetButton = ({ section }: { section: string }) => (
    <button
      onClick={() => handleReset(section)}
      className="text-[9px] text-ui-muted hover:text-accent transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
    >
      <RotateCcw className="w-3 h-3" />
      Reset
    </button>
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Frame Style & Device Selection */}
      <div className="style-section">
        <SidebarHeader icon={<Palette className="w-4 h-4" />}>Frame Style</SidebarHeader>

        <DropdownTrigger
          icon={frameMode === 'device' ? 'smartphone' : 'palette'}
          label={frameMode === 'device' ? 'Device Mockup' : 'Frame Style'}
          value={getFormattedValue()}
          onClick={() => setIsFrameModalOpen(true)}
        />
      </div>

      <FrameStyleModal isOpen={isFrameModalOpen} onClose={() => setIsFrameModalOpen(false)} />

      {/* 3D Rotation */}
      <div className="style-section group">
        <SidebarHeader
          icon={<Box className="w-4 h-4" />}
          action={<ResetButton section="rotation" />}
        >
          3D Rotation
        </SidebarHeader>
        <ControlGroup>
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
        </ControlGroup>
      </div>

      {/* Transform */}
      <div className="style-section group">
        <SidebarHeader
          icon={<Move3d className="w-4 h-4" />}
          action={<ResetButton section="transform" />}
        >
          Transform
        </SidebarHeader>
        <ControlGroup>
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
            icon={<Square className="w-3.5 h-3.5" />}
            value={cornerRadius}
            min={0}
            max={60}
            unit="px"
            onChange={setCornerRadius}
          />
        </ControlGroup>
      </div>

      {/* Shadow & Glow */}
      <div className="style-section group">
        <SidebarHeader
          icon={<CloudFog className="w-4 h-4" />}
          action={<ResetButton section="shadow" />}
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
                                : '0 0 10px rgba(255,255,255,0.8)',
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
          </ControlGroup>
        )}
      </div>

      {/* Creative Angles */}
      <CreativeAngles />

      {/* Layout Picker */}
      <LayoutPicker />
    </div>
  );
};
