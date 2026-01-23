import { useRef, useEffect, useState } from 'react';
import {
  ArrowUpDown,
  ArrowLeftRight,
  RotateCw,
  Maximize2,
  RotateCcw,
  Box,
  Square,
  Move,
  Palette,
} from 'lucide-react';
import { ShadowGlowPanel } from './ShadowGlowPanel';
import { useRenderStore } from '../store/renderStore';
import { DURATIONS, EASINGS, STAGGER_DEFAULTS } from '../constants/animations';
import { FrameStyleModal } from './modals/FrameStyleModal';

import { DropdownTrigger } from './ui/Dropdown';
import { SliderControl } from './ui/SliderControl';
import { SidebarHeader, ControlGroup } from './ui/SidebarPrimitives';
import { PositionPicker } from './ui/PositionPicker';
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
    frameMode,
    deviceType,
    textOverlay,
    setTextOverlay,
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
        setDeviceScale(1);
        setCornerRadius(12);
        break;
      case 'transform':
        setDeviceScale(1);
        setCornerRadius(12);
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

      {/* Media Position */}
      <div className="style-section">
        <SidebarHeader icon={<Move className="w-4 h-4" />}>Media Position</SidebarHeader>
        <PositionPicker
          value={textOverlay.devicePosition}
          onChange={(pos) => setTextOverlay({ devicePosition: pos as any })}
          type="media"
          size="sm"
        />
      </div>

      {/* Creative Angles */}
      <CreativeAngles />

      {/* Layout Picker */}
      <LayoutPicker />

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
            min={0}
            max={360}
            unit="°"
            onChange={setRotationZ}
          />

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
      <ShadowGlowPanel />
    </div>
  );
};
