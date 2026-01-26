import { useRef, useEffect } from 'react';
import { Maximize2, RotateCcw, Box, Square, Move } from 'lucide-react';
import { ShadowGlowPanel } from './ShadowGlowPanel';
import { useRenderStore } from '../store/renderStore';
import { DURATIONS, EASINGS, STAGGER_DEFAULTS } from '../constants/animations';
import { SliderControl } from './ui/SliderControl';
import { SidebarHeader, ControlGroup } from './ui/SidebarPrimitives';
import { PositionPicker } from './ui/PositionPicker';

export const CameraStylePanel = () => {
  const {
    setRotationX,
    setRotationY,
    setRotationZ,
    cornerRadius,
    setCornerRadius,
    deviceScale,
    setDeviceScale,
    mediaPosition,
    setMediaPosition,
    mediaOffsetX,
    mediaOffsetY,
    setMediaOffsetX,
    setMediaOffsetY,
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
        <div className="space-y-4">
          <PositionPicker
            value={mediaPosition}
            onChange={(pos) => setMediaPosition(pos as any)}
            type="media"
            size="sm"
          />
          <ControlGroup>
            <SliderControl
              label="X Offset"
              value={mediaOffsetX}
              min={-50}
              max={50}
              unit="%"
              onChange={setMediaOffsetX}
            />
            <SliderControl
              label="Y Offset"
              value={mediaOffsetY}
              min={-50}
              max={50}
              unit="%"
              onChange={setMediaOffsetY}
            />
          </ControlGroup>
        </div>
      </div>

      {/* Shadow & Glow */}
      <ShadowGlowPanel />

      {/* Device Scale & Corners */}
      <div className="style-section group">
        <SidebarHeader
          icon={<Box className="w-4 h-4" />}
          action={<ResetButton section="transform" />}
        >
          Mockup Constraints
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
    </div>
  );
};
