import { useMemo } from 'react';
import { generateTextKeyframes } from '../constants/textAnimations';
import { useRenderStore } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';

type TextOverlayProps = {
  isPreview?: boolean;
};

export const TextOverlayRenderer = ({ isPreview = false }: TextOverlayProps) => {
  const { textOverlay, durationMs } = useRenderStore();
  const { playheadMs, isPlaying } = useTimelineStore();

  // Calculate animation progress (0 to 1)
  const progress = useMemo(() => {
    if (!isPlaying && playheadMs === 0) return 1;
    // Animate in first 40% of duration
    const animDuration = (durationMs || 3000) * 0.4;
    return Math.min(1, playheadMs / animDuration);
  }, [playheadMs, durationMs, isPlaying]);

  if (!textOverlay.enabled) return null;

  const {
    headline,
    tagline,
    fontFamily,
    fontSize,
    taglineFontSize,
    fontWeight,
    color,
    animation,
    layout,
  } = textOverlay;

  // Scale for preview mode
  const scale = isPreview ? 0.25 : 1;
  const headlineSize = Math.max(12, fontSize * scale);
  const taglineSize = Math.max(10, taglineFontSize * scale);
  const padding = isPreview ? 8 : 40;

  // Position styles based on layout
  const getPositionStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: 0,
      right: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding,
      zIndex: 50,
      pointerEvents: 'none',
      gap: isPreview ? 4 : 12,
    };

    switch (layout) {
      case 'text-top-device-bottom':
        return { ...baseStyle, top: 0, height: '35%' };
      case 'text-bottom-device-top':
        return { ...baseStyle, bottom: 0, height: '35%' };
      case 'text-center-device-behind':
      case 'text-overlay':
        return { ...baseStyle, top: 0, bottom: 0, height: '100%' };
      default:
        return { ...baseStyle, top: 0, height: '35%' };
    }
  };

  // Get animation styles for headline
  const animationType = (animation || 'fade') as 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'blur';
  const animStyles = generateTextKeyframes(animationType, progress);

  // Headline style (animated)
  const headlineStyle: React.CSSProperties = {
    fontFamily,
    fontSize: headlineSize,
    fontWeight,
    color,
    textAlign: 'center',
    lineHeight: 1.1,
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    opacity: animStyles.opacity,
    transform: animStyles.transform,
    filter: animStyles.filter,
    willChange: 'opacity, transform, filter',
  };

  // Tagline style (static, always visible)
  const taglineStyle: React.CSSProperties = {
    fontFamily,
    fontSize: taglineSize,
    fontWeight: 400,
    color,
    textAlign: 'center',
    lineHeight: 1.3,
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    opacity: 0.85,
  };

  return (
    <div style={getPositionStyle()}>
      {headline && <div style={headlineStyle}>{headline}</div>}
      {tagline && <div style={taglineStyle}>{tagline}</div>}
    </div>
  );
};
