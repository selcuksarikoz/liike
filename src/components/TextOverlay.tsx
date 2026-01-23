import { useMemo } from 'react';
import { generateTextKeyframes, ANIMATION_SPEED_MULTIPLIERS, type TextAnimationType } from '../constants/textAnimations';
import { useRenderStore, type TextPosition } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';

type TextOverlayProps = {
  isPreview?: boolean;
};

export const TextOverlayRenderer = ({ isPreview = false }: TextOverlayProps) => {
  const { textOverlay, durationMs, animationSpeed } = useRenderStore();
  const { playheadMs, isPlaying } = useTimelineStore();

  // Get speed multiplier
  const speedMultiplier = ANIMATION_SPEED_MULTIPLIERS[animationSpeed];

  // Calculate animation progress for headline (0 to 1)
  const headlineProgress = useMemo(() => {
    if (!isPlaying && playheadMs === 0) return 1;
    // Headline animates in first 30% of duration, adjusted by speed
    const animDuration = ((durationMs || 3000) * 0.3) / speedMultiplier;
    return Math.min(1, playheadMs / animDuration);
  }, [playheadMs, durationMs, isPlaying, speedMultiplier]);

  // Calculate animation progress for tagline (staggered, starts at 15%)
  const taglineProgress = useMemo(() => {
    if (!isPlaying && playheadMs === 0) return 1;
    // Tagline starts after 15% of duration, animates for 30%, adjusted by speed
    const staggerDelay = ((durationMs || 3000) * 0.15) / speedMultiplier;
    const animDuration = ((durationMs || 3000) * 0.3) / speedMultiplier;
    const delayedPlayhead = Math.max(0, playheadMs - staggerDelay);
    return Math.min(1, delayedPlayhead / animDuration);
  }, [playheadMs, durationMs, isPlaying, speedMultiplier]);

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

  // Headline style (animated)
  const headlineStyle: React.CSSProperties = {
    fontFamily,
    fontSize: headlineSize,
    fontWeight,
    color,
    textAlign: 'center',
    lineHeight: 1.1,
    textShadow: '0 2px 4px rgba(0,0,0,0.4)',
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
    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
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
