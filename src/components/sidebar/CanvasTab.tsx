import { CircleDot, Dice4, Palette, Square, TabletSmartphone } from 'lucide-react';
import { getFrameLabel } from '../../constants/styles';
import { DropdownTrigger } from '../ui/Dropdown';
import { ControlGroup, SidebarHeader, SidebarSection } from '../ui/SidebarPrimitives';
import { SliderControl } from '../ui/SliderControl';

type CanvasTabProps = {
  canvasWidth: number;
  canvasHeight: number;
  canvasCornerRadius: number;
  canvasBorderWidth: number;
  canvasBorderColor: string;
  imageAspectRatio: string;
  onFrameClick: () => void;
  onAspectRatioClick: () => void;
  onCornerRadiusChange: (v: number) => void;
  onBorderWidthChange: (v: number) => void;
  onBorderColorChange: (v: string) => void;
};

export const CanvasTab = ({
  canvasWidth,
  canvasHeight,
  canvasCornerRadius,
  canvasBorderWidth,
  canvasBorderColor,
  imageAspectRatio,
  onFrameClick,
  onAspectRatioClick,
  onCornerRadiusChange,
  onBorderWidthChange,
  onBorderColorChange,
}: CanvasTabProps) => (
  <div className="flex flex-col">
    <SidebarSection padded>
      <SidebarHeader icon={<Dice4 className="w-4 h-4" />}>Canvas Size</SidebarHeader>
      <DropdownTrigger
        icon="crop"
        label={getFrameLabel(canvasWidth, canvasHeight)}
        value={`${canvasWidth} × ${canvasHeight}`}
        onClick={onFrameClick}
      />
    </SidebarSection>

    <div className="h-px bg-ui-border mx-4" />

    <SidebarSection padded>
      <SidebarHeader icon={<Palette className="w-4 h-4" />}>Canvas Style</SidebarHeader>
      <ControlGroup>
        <SliderControl
          label="Corner Radius"
          icon={<CircleDot className="w-3.5 h-3.5" />}
          value={canvasCornerRadius}
          min={0}
          max={100}
          unit="px"
          onChange={onCornerRadiusChange}
        />
        <SliderControl
          label="Border Width"
          icon={<Square className="w-3.5 h-3.5" />}
          value={canvasBorderWidth}
          min={0}
          max={20}
          unit="px"
          onChange={onBorderWidthChange}
        />
        {canvasBorderWidth > 0 && (
          <div className="flex items-center justify-between pt-1">
            <label className="text-[10px] text-ui-muted">Border Color</label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-ui-text font-mono uppercase">
                {canvasBorderColor}
              </span>
              <input
                type="color"
                value={canvasBorderColor}
                onChange={(e) => onBorderColorChange(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent"
              />
            </div>
          </div>
        )}
      </ControlGroup>
    </SidebarSection>

    <div className="h-px bg-ui-border mx-4" />

    <SidebarSection padded>
      <SidebarHeader icon={<TabletSmartphone className="w-4 h-4" />}>
        Media Aspect Ratio
      </SidebarHeader>
      <DropdownTrigger
        icon="aspect_ratio"
        label={imageAspectRatio === 'free' ? 'Free' : imageAspectRatio}
        value={imageAspectRatio === 'free' ? 'No constraint' : `${imageAspectRatio} ratio`}
        onClick={onAspectRatioClick}
      />
    </SidebarSection>
  </div>
);
