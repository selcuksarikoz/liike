import { useRef, useMemo, memo } from 'react';
import { STYLE_PRESETS } from '../constants/styles';
import type { MediaAsset, AspectRatio } from '../store/renderStore';
import { DEVICES } from '../constants/devices';
import { GenericDeviceMockup } from './DeviceMockups/GenericDeviceMockup';
import { getAspectRatioValue } from '../constants/ui';
import type { ImageLayout } from '../constants/layouts';
import type { AnimationInfo } from '../utils/animationHelpers';
import { MediaContainer } from './MediaContainer';

// Layout components
import {
  SingleLayout,
  SideBySideLayout,
  StackedLayout,
  DiagonalLayout,
  PolaroidLayout,
  TrioRowLayout,
  TrioColumnLayout,
  FanLayout,
  MasonryLayout,
  MosaicLayout,
  FilmStripLayout,
  SpotlightLayout,
  AsymmetricLayout,
  GridLayout,
  OverlapLayout,
  CreativeLayout,
  CrossLayout,
  MagazineLayout,
  ShowcaseLayout,
  ScatteredLayout,
  CascadeLayout,
  BrickLayout,
} from './layouts';

type ImageRendererProps = {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  cornerRadius: number;
  mediaAssets: (MediaAsset | null)[];
  aspectRatio?: AspectRatio;
  scale?: number;
  isPreview?: boolean;
  onScreenClick?: (index: number) => void;
  stylePreset?: string;
  shadowType?: string;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowBlur?: number;
  shadowX?: number;
  shadowY?: number;
  layout?: ImageLayout;
  animationInfo?: AnimationInfo;
  playing?: boolean;
  frameMode?: 'basic' | 'device';
  deviceType?: string;
};

const DeviceRendererComponent = ({
  rotationX,
  rotationY,
  rotationZ,
  cornerRadius,
  mediaAssets,
  aspectRatio = 'free',
  isPreview = false,
  onScreenClick,
  scale = 1,
  stylePreset = 'default',
  shadowType = 'spread',
  shadowOpacity = 40,
  shadowColor = '#000000',
  shadowBlur = 30,
  shadowX = 0,
  shadowY = 20,
  layout = 'single',
  animationInfo,
  playing = true,
  frameMode = 'basic',
  deviceType = 'iphone',
}: ImageRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoized style preset CSS
  const styleCSS = useMemo(() => {
    const preset = STYLE_PRESETS.find((p) => p.id === stylePreset);
    if (!preset || stylePreset === 'default') return {};
    return preset.css;
  }, [stylePreset]);

  // Memoized computed shadow - drop-shadow filter (works better with 3D transforms)
  // Combines main shadow with preset dropShadow
  const shadowFilter = useMemo(() => {
    const shadows: string[] = [];

    // Main shadow from controls (unless preview, none, or device mode)
    if (!isPreview && shadowType !== 'none' && frameMode !== 'device') {
      const hex = shadowColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const alpha = shadowOpacity / 100;
      const rgba = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      shadows.push(`drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px ${rgba})`);
    }

    // Preset dropShadow (if any)
    const presetDropShadow = (styleCSS as { dropShadow?: string }).dropShadow;
    if (presetDropShadow && !isPreview) {
      shadows.push(`drop-shadow(${presetDropShadow})`);
    }

    return shadows.length > 0 ? shadows.join(' ') : 'none';
  }, [isPreview, shadowType, shadowColor, shadowOpacity, shadowBlur, shadowX, shadowY, frameMode, styleCSS]);

  // Don't apply user aspect ratio when in device mode
  const aspectValue = frameMode === 'device' ? null : getAspectRatioValue(aspectRatio);

  // No corner radius when in device mode
  const effectiveCornerRadius = frameMode === 'device' ? 0 : cornerRadius;

  // Helper to wrap content in device mockup if enabled
  const renderWithMockup = (content: React.ReactNode, key?: number | string) => {
    if (frameMode === 'device' && deviceType) {
      const config =
        DEVICES.find((d) => d.id === deviceType) || DEVICES.find((d) => d.id === 'iphone-16-pro');

      const type = config?.type;
      const deviceScale =
        type === 'watch'
          ? scale * 0.9
          : type === 'desktop'
            ? scale * 0.45
            : type === 'laptop'
              ? scale * 0.55
              : type === 'tablet'
                ? scale * 0.65
                : scale * 0.85;

      return (
        <div key={key} className="relative flex items-center justify-center pointer-events-none">
          <GenericDeviceMockup config={config} scale={isPreview ? 0.2 : deviceScale}>
            {content}
          </GenericDeviceMockup>
        </div>
      );
    }
    return content;
  };

  const containerStyle = {
    transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ || 0}deg) scale(${scale})`,
    transformStyle: 'preserve-3d' as const,
  };

  const sizePercent = isPreview ? '100%' : '85%';

  // Common props for all layouts
  const layoutProps = {
    containerRef,
    containerStyle,
    mediaAssets,
    effectiveCornerRadius,
    shadowFilter,
    styleCSS,
    isPreview,
    onScreenClick,
    playing,
    animationInfo,
    aspectValue,
    sizePercent,
    renderWithMockup,
    cornerRadius,
  };

  // Layout routing
  switch (layout) {
    case 'single':
      return <SingleLayout {...layoutProps} />;

    // Duo layouts
    case 'side-by-side':
      return <SideBySideLayout {...layoutProps} />;
    case 'stacked':
      return <StackedLayout {...layoutProps} />;
    case 'diagonal':
      return <DiagonalLayout {...layoutProps} />;
    case 'polaroid':
      return <PolaroidLayout {...layoutProps} />;

    // Trio layouts
    case 'trio-row':
      return <TrioRowLayout {...layoutProps} />;
    case 'trio-column':
      return <TrioColumnLayout {...layoutProps} />;
    case 'fan':
      return <FanLayout {...layoutProps} />;
    case 'masonry':
      return <MasonryLayout {...layoutProps} />;
    case 'mosaic':
      return <MosaicLayout {...layoutProps} />;
    case 'film-strip':
      return <FilmStripLayout {...layoutProps} />;
    case 'spotlight':
      return <SpotlightLayout {...layoutProps} />;
    case 'asymmetric':
      return <AsymmetricLayout {...layoutProps} />;

    // Quad layouts
    case 'grid':
      return <GridLayout {...layoutProps} />;
    case 'overlap':
      return <OverlapLayout {...layoutProps} />;
    case 'creative':
      return <CreativeLayout {...layoutProps} />;
    case 'cross':
      return <CrossLayout {...layoutProps} />;
    case 'magazine':
      return <MagazineLayout {...layoutProps} />;
    case 'showcase':
      return <ShowcaseLayout {...layoutProps} />;
    case 'scattered':
      return <ScatteredLayout {...layoutProps} />;
    case 'cascade':
      return <CascadeLayout {...layoutProps} />;
    case 'brick':
      return <BrickLayout {...layoutProps} />;

    // Default fallback (single)
    default: {
      const { dropShadow: _, ...containerCSS } = styleCSS as typeof styleCSS & { dropShadow?: string };
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div
            ref={containerRef}
            className="relative overflow-hidden transition-[transform,border-radius] duration-300 ease-out"
            style={{
              ...containerStyle,
              width: aspectValue ? 'auto' : sizePercent,
              height: aspectValue ? sizePercent : sizePercent,
              aspectRatio: aspectValue ? aspectValue : undefined,
              maxWidth: sizePercent,
              maxHeight: sizePercent,
              borderRadius: `${effectiveCornerRadius}px`,
              backfaceVisibility: 'hidden',
              ...containerCSS,
            }}
          >
            <MediaContainer
              index={0}
              media={mediaAssets[0]}
              cornerRadius={effectiveCornerRadius}
              isPreview={isPreview}
              onScreenClick={onScreenClick}
              styleCSS={styleCSS}
              dropShadowFilter={shadowFilter}
              playing={playing}
            />
          </div>
        </div>
      );
    }
  }
};

// Memoized DeviceRenderer export - prevents unnecessary re-renders
export const DeviceRenderer = memo(DeviceRendererComponent, (prev, next) => {
  // Shallow comparison for primitives
  if (prev.rotationX !== next.rotationX) return false;
  if (prev.rotationY !== next.rotationY) return false;
  if (prev.rotationZ !== next.rotationZ) return false;
  if (prev.cornerRadius !== next.cornerRadius) return false;
  if (prev.scale !== next.scale) return false;
  if (prev.layout !== next.layout) return false;
  if (prev.aspectRatio !== next.aspectRatio) return false;
  if (prev.stylePreset !== next.stylePreset) return false;
  if (prev.shadowType !== next.shadowType) return false;
  if (prev.shadowOpacity !== next.shadowOpacity) return false;
  if (prev.shadowColor !== next.shadowColor) return false;
  if (prev.shadowBlur !== next.shadowBlur) return false;
  if (prev.shadowX !== next.shadowX) return false;
  if (prev.shadowY !== next.shadowY) return false;
  if (prev.isPreview !== next.isPreview) return false;
  if (prev.playing !== next.playing) return false;
  if (prev.frameMode !== next.frameMode) return false;
  if (prev.deviceType !== next.deviceType) return false;

  // Reference comparison for arrays/objects
  if (prev.mediaAssets !== next.mediaAssets) return false;

  // AnimationInfo deep comparison
  if (!prev.animationInfo && !next.animationInfo) return true;
  if (!prev.animationInfo || !next.animationInfo) return false;
  if (prev.animationInfo.progress !== next.animationInfo.progress) return false;
  if (prev.animationInfo.easing !== next.animationInfo.easing) return false;
  if (prev.animationInfo.stagger !== next.animationInfo.stagger) return false;
  if (prev.animationInfo.animations.length !== next.animationInfo.animations.length) return false;

  return true;
});
