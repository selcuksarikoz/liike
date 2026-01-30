import { combineAnimations, CSS_TRANSITIONS } from '../constants/animations';

export type AnimationInfo = {
  animations: { type: string; intensity?: number }[];
  progress: number;
  easing: string;
  stagger?: number;
  totalDuration?: number;
};

export type StaggeredAnimationStyle = {
  transform: string;
  opacity: number;
};

/**
 * Calculate staggered animation style for each image in a layout
 */
export const getStaggeredAnimationStyle = (
  animationInfo: AnimationInfo | undefined,
  imageIndex: number,
  totalImages: number
): StaggeredAnimationStyle => {
  if (!animationInfo || animationInfo.animations.length === 0) {
    return { transform: 'none', opacity: 1 };
  }

  const { animations, progress, easing, stagger = 0.15 } = animationInfo;

  // Calculate delayed progress for this image
  const staggerDelay = imageIndex * stagger;
  const adjustedProgress = Math.max(
    0,
    Math.min(1, (progress - staggerDelay) / (1 - stagger * (totalImages - 1)))
  );

  // If this image hasn't started animating yet
  if (adjustedProgress <= 0) {
    const firstAnim = animations[0]?.type;
    if (firstAnim === 'zoom-up') {
      return { transform: 'scale(0.7) translateY(30px)', opacity: 0 };
    }
    if (firstAnim === 'zoom-down') {
      return { transform: 'scale(0.7) translateY(-30px)', opacity: 0 };
    }
    if (firstAnim === 'reveal-zoom') {
      return { transform: 'scale(0.2) rotateX(45deg) translateZ(0)', opacity: 0 };
    }
    if (firstAnim === 'zoom' || firstAnim === 'zoom-in' || firstAnim === 'zoom-out') {
      return { transform: 'scale(1)', opacity: 0 };
    }
    if (
      firstAnim?.includes('slide') ||
      firstAnim === 'spiral' ||
      firstAnim === 'fan' ||
      firstAnim === 'domino' ||
      firstAnim === 'converge' ||
      firstAnim === 'diverge' ||
      firstAnim === 'elevator' ||
      firstAnim === 'skew-slide'
    ) {
      return { transform: 'scale(0)', opacity: 0 };
    }
    if (isZoom) {
      return { transform: 'scale(0.95)', opacity: 0 };
    }
    return { transform: 'none', opacity: 1 };
  }

  const result = combineAnimations(animations, adjustedProgress, easing);
  return {
    transform: result.transform,
    opacity: result.opacity ?? 1,
  };
};

/**
 * Get transition style based on animation state
 */
export const getLayoutTransition = (hasAnimation: boolean): string => {
  return hasAnimation ? 'none' : CSS_TRANSITIONS.stagger;
};
