import { useMemo } from 'react';
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
    if (!isPlaying && playheadMs === 0) return 1; // Show full text when not playing
    return Math.min(1, playheadMs / (durationMs || 3000));
  }, [playheadMs, durationMs, isPlaying]);

  // Dynamic font size scaling for long text
  const adjustedFontSize = useMemo(() => {
    const { text = '', fontSize = 48 } = textOverlay || {};
    let size = isPreview ? Math.max(12, fontSize * 0.25) : fontSize;
    if (text.length > 50) size *= 0.8;
    if (text.length > 100) size *= 0.6;
    return size;
  }, [textOverlay.fontSize, textOverlay.text, isPreview]);

  if (!textOverlay.enabled) return null;

  const { text, fontFamily, fontSize, fontWeight, color, animation, layout } = textOverlay;

  // Position styles based on layout
  const getPositionStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isPreview ? '8px' : '32px',
      zIndex: 50,
      pointerEvents: 'none',
    };

    switch (layout) {
      case 'text-top-device-bottom':
        return { ...baseStyle, top: 0, height: '25%' };
      case 'text-bottom-device-top':
        return { ...baseStyle, bottom: 0, height: '25%' };
      case 'text-left-device-right':
        return {
          ...baseStyle,
          left: 0,
          top: 0,
          bottom: 0,
          right: 'auto',
          width: '40%',
          height: '100%',
          flexDirection: 'column',
          textAlign: 'center',
        };
      case 'text-right-device-left':
        return {
          ...baseStyle,
          right: 0,
          top: 0,
          bottom: 0,
          left: 'auto',
          width: '40%',
          height: '100%',
          flexDirection: 'column',
          textAlign: 'center',
        };
      case 'text-overlay':
      case 'text-center-device-behind':
        return {
          ...baseStyle,
          top: 0,
          bottom: 0,
          height: '100%',
        };
      case 'text-split-device-center':
        return { ...baseStyle, top: 0, height: '20%' };
      default:
        return { ...baseStyle, top: 0, height: '25%' };
    }
  };

  // Simple text styles without complex animations for now
  const textStyle: React.CSSProperties = {
    fontFamily,
    fontSize: adjustedFontSize,
    fontWeight,
    color,
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    lineHeight: 1.1,
    textShadow: '0 2px 20px rgba(0,0,0,0.5)',
    maxWidth: '95%',
    maxHeight: '100%',
    overflow: 'hidden',
    transition: 'all 0.3s ease-out',
  };

  // Apply animation based on progress
  const getAnimatedStyle = (): React.CSSProperties => {
    if (animation === 'none' || !animation) {
      return textStyle;
    }

    // Simple opacity/transform animation for the whole text block
    const animProgress = Math.min(1, progress * 2); // Animate in first half of duration

    switch (animation) {
      case 'scale-pop':
        const scale = 0.5 + animProgress * 0.5;
        return {
          ...textStyle,
          opacity: animProgress,
          transform: `scale(${scale})`,
        };
      case 'blur-in':
        return {
          ...textStyle,
          opacity: animProgress,
          filter: `blur(${(1 - animProgress) * 10}px)`,
        };
      case 'word-fade-in':
      case 'typewriter':
        return {
          ...textStyle,
          opacity: animProgress,
          transform: `translateY(${(1 - animProgress) * 20}px)`,
        };
      case 'word-slide-up':
        return {
          ...textStyle,
          opacity: animProgress,
          transform: `translateY(${(1 - animProgress) * 40}px)`,
        };
      case 'letter-cascade':
        return {
          ...textStyle,
          opacity: animProgress,
          transform: `translateY(${(1 - animProgress) * -30}px)`,
        };
      case 'bounce-letters':
        const bounce = animProgress < 0.7 ? animProgress / 0.7 : 1;
        return {
          ...textStyle,
          opacity: animProgress,
          transform: `scale(${0.8 + bounce * 0.2})`,
        };
      case 'glow-reveal':
        return {
          ...textStyle,
          opacity: animProgress,
          textShadow: `0 0 ${20 + (1 - animProgress) * 30}px ${color}, 0 2px 20px rgba(0,0,0,0.5)`,
        };
      case 'split-reveal':
        return {
          ...textStyle,
          opacity: animProgress,
          letterSpacing: `${(1 - animProgress) * 20}px`,
        };
      default:
        return {
          ...textStyle,
          opacity: animProgress,
        };
    }
  };

  return (
    <div style={getPositionStyle()}>
      <span style={getAnimatedStyle()}>{text}</span>
    </div>
  );
};
