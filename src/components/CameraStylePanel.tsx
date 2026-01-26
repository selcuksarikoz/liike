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
} from 'lucide-react';
import { ShadowGlowPanel } from './ShadowGlowPanel';
import { useRenderStore } from '../store/renderStore';
import { DURATIONS, EASINGS, STAGGER_DEFAULTS } from '../constants/animations';
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
    mediaPosition,
    setMediaPosition,
  } = useRenderStore();

  const containerRef = useRef<HTMLDivElement>(null);

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
      {/* Media Position */}
      <div className="style-section">
        <SidebarHeader icon={<Move className="w-4 h-4" />}>Media Position</SidebarHeader>
        <PositionPicker
          value={mediaPosition}
          onChange={(pos) => setMediaPosition(pos as any)}
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
