import { useMemo } from 'react';
import { generateTextKeyframes, ANIMATION_SPEED_MULTIPLIERS, type TextAnimationType } from '../constants/textAnimations';
import { useRenderStore, type TextPosition } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';

type TextOverlayProps = {
  isPreview?: boolean;
};

export const TextOverlayRenderer = ({ isPreview = false }: TextOverlayProps) => {
  const { textOverlay, durationMs, animationSpeed } = useRenderStore();
  const { playheadMs } = useTimelineStore();

  // Get speed multiplier
  const speedMultiplier = ANIMATION_SPEED_MULTIPLIERS[animationSpeed];

  // Initial delay before text animation starts (ms)
  const startDelay = 300 / speedMultiplier;

  // Calculate animation progress for headline (0 to 1)
  const headlineProgress = useMemo(() => {
    // Wait for startDelay before beginning animation
    const delayedPlayhead = Math.max(0, playheadMs - startDelay);
    if (delayedPlayhead === 0) return 0;
    // Headline animates in first 30% of duration, adjusted by speed
    const animDuration = ((durationMs || 3000) * 0.3) / speedMultiplier;
    return Math.min(1, delayedPlayhead / animDuration);
  }, [playheadMs, durationMs, speedMultiplier, startDelay]);

  // Calculate animation progress for tagline (staggered, starts after headline)
  const taglineProgress = useMemo(() => {
    // Tagline starts after startDelay + 15% of duration
    const staggerDelay = startDelay + ((durationMs || 3000) * 0.15) / speedMultiplier;
    const animDuration = ((durationMs || 3000) * 0.3) / speedMultiplier;
    const delayedPlayhead = Math.max(0, playheadMs - staggerDelay);
    return Math.min(1, delayedPlayhead / animDuration);
  }, [playheadMs, durationMs, speedMultiplier, startDelay]);

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
    position,
    shadowEnabled,
    shadowBlur,
    shadowOffsetY,
    shadowColor,
    shadowOpacity,
  } = textOverlay;

  // Scale for preview mode
  const scale = isPreview ? 0.25 : 1;
  const headlineSize = Math.max(12, fontSize * scale);
  const taglineSize = Math.max(10, taglineFontSize * scale);
  const padding = isPreview ? 8 : 40;

  // Get alignment based on 9-position grid
  const getPositionStyle = (): React.CSSProperties => {
    const pos = (position || 'top-center') as TextPosition;

    // Vertical alignment
    let justifyContent: React.CSSProperties['justifyContent'] = 'center';
    if (pos.startsWith('top')) {
      justifyContent = 'flex-start';
    } else if (pos.startsWith('bottom')) {
      justifyContent = 'flex-end';
    }

    // Horizontal alignment
    let alignItems: React.CSSProperties['alignItems'] = 'center';
    let textAlign: React.CSSProperties['textAlign'] = 'center';

    if (pos.endsWith('left')) {
      alignItems = 'flex-start';
      textAlign = 'left';
    } else if (pos.endsWith('right')) {
      alignItems = 'flex-end';
      textAlign = 'right';
    }

    return {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent,
      alignItems,
      padding,
      paddingTop: pos.startsWith('top') ? padding * 1.5 : padding,
      paddingBottom: pos.startsWith('bottom') ? padding * 1.5 : padding,
      zIndex: 50,
      pointerEvents: 'none',
      gap: isPreview ? 4 : 12,
      textAlign,
    };
  };

  // Get animation styles
  const animationType = (animation || 'blur') as TextAnimationType;
  const headlineAnimStyles = generateTextKeyframes(animationType, headlineProgress);
  const taglineAnimStyles = generateTextKeyframes(animationType, taglineProgress);

  // Convert hex color to rgba with opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${opacity / 100})`;
  };

  // Text shadow from store settings (scales with content)
  const shadowRgba = hexToRgba(shadowColor, shadowOpacity);
  const shadowRgbaLight = hexToRgba(shadowColor, shadowOpacity * 0.5);
  const textShadow = shadowEnabled
    ? `0 ${shadowOffsetY * scale}px ${shadowBlur * scale}px ${shadowRgba}, 0 ${shadowOffsetY * 0.5 * scale}px ${shadowBlur * 0.3 * scale}px ${shadowRgbaLight}`
    : 'none';

  // Headline style (animated)
  const headlineStyle: React.CSSProperties = {
    fontFamily,
    fontSize: headlineSize,
    fontWeight,
    color,
    textAlign: 'center',
    lineHeight: 1.1,
    textShadow,
    opacity: headlineAnimStyles.opacity,
    transform: headlineAnimStyles.transform,
    filter: headlineAnimStyles.filter,
    clipPath: headlineAnimStyles.clipPath,
    willChange: 'opacity, transform, filter, clip-path',
  };

  // Tagline style (animated with stagger)
  const taglineStyle: React.CSSProperties = {
    fontFamily,
    fontSize: taglineSize,
    fontWeight: 400,
    color,
    textAlign: 'center',
    lineHeight: 1.3,
    textShadow,
    opacity: taglineAnimStyles.opacity * 0.9,
    transform: taglineAnimStyles.transform,
    filter: taglineAnimStyles.filter,
    clipPath: taglineAnimStyles.clipPath,
    willChange: 'opacity, transform, filter, clip-path',
  };

  return (
    <div style={getPositionStyle()}>
      {headline && <div style={headlineStyle}>{headline}</div>}
      {tagline && <div style={taglineStyle}>{tagline}</div>}
    </div>
  );
};
