// Centralized animation constants and utilities
// Using Web Animations API instead of GSAP

// =============================================================================
// DURATIONS (in milliseconds for Web Animations API)
// =============================================================================
export const DURATIONS = {
  // Fast micro-interactions
  instant: 150,
  fast: 200,
  quick: 250,

  // Standard transitions
  normal: 300,
  medium: 350,
  standard: 400,

  // Slower, more dramatic
  slow: 450,
  entrance: 500,
  dramatic: 600,
} as const;

// =============================================================================
// EASINGS (CSS easing functions)
// =============================================================================
export const EASINGS = {
  // Standard easings
  linear: 'linear',
  easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
  easeIn: 'cubic-bezier(0.32, 0, 0.67, 0)',
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',

  // Smooth easings (power3)
  smoothOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  smoothIn: 'cubic-bezier(0.64, 0, 0.78, 0)',
  smoothInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',

  // Bounce/back effects
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounceMild: 'cubic-bezier(0.34, 1.3, 0.64, 1)',
  bounceSubtle: 'cubic-bezier(0.34, 1.15, 0.64, 1)',

  // Sine (organic motion)
  sineInOut: 'cubic-bezier(0.37, 0, 0.63, 1)',
  sineOut: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
  sineIn: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
} as const;

// =============================================================================
// CSS TRANSITIONS (for inline styles)
// =============================================================================
export const CSS_TRANSITIONS = {
  // Standard smooth transition
  default: 'all 0.3s ease',

  // Transform-specific (used for staggered animations)
  stagger: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1)',

  // Duration variations
  fast: 'all 0.15s ease',
  medium: 'all 0.35s ease',
  slow: 'all 0.5s ease',

  // Property-specific
  transform: 'transform 0.3s ease',
  opacity: 'opacity 0.3s ease',
  scale: 'transform 0.5s ease',
} as const;

// =============================================================================
// ANIMATION DEFAULT INTENSITIES
// =============================================================================
export const DEFAULT_INTENSITIES: Record<string, number> = {
  // Movement animations
  float: 15,
  bounce: 20,
  shake: 5,

  // Rotation animations
  rotate: 360,
  swing: 15,
  spiral: 360,
  fan: 30,
  domino: 15,

  // Scale animations
  zoom: 1.2,
  'zoom-in': 1.2,
  'zoom-out': 1.3,
  'zoom-up': 1.1,
  'zoom-down': 1.1,
  pulse: 1.1,

  // Slide animations
  slide: 100,
  'slide-right': 100,
  'slide-left': 100,
  'slide-up': 60,
  'slide-down': 60,
  'elastic-rotate': 15,
  'converge': 50,
  'diverge': 20,
  'glitch': 5,
  'wobble-3d': 15,
  'rotate-3d': 360,
  'elevator': 1,
  'skew-slide': 20,
} as const;

export const getDefaultIntensity = (type: string): number => {
  return DEFAULT_INTENSITIES[type] ?? 1;
};

// =============================================================================
// EASING FUNCTIONS (for custom calculations)
// =============================================================================
export const applyEasing = (progress: number, easing: string): number => {
  switch (easing) {
    case 'ease-in':
      return progress * progress;
    case 'ease-out':
      return 1 - (1 - progress) * (1 - progress);
    case 'ease-in-out':
      return progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    case 'linear':
    default:
      return progress;
  }
};

// =============================================================================
// WEB ANIMATIONS API HELPER
// =============================================================================
export type AnimationConfig = {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
};

export const animate = (
  element: Element | null,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions
): Animation | null => {
  if (!element) return null;
  return element.animate(keyframes, options);
};

export const animateWithCleanup = (
  element: Element | null,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions
): { animation: Animation | null; cleanup: () => void } => {
  const animation = animate(element, keyframes, options);
  return {
    animation,
    cleanup: () => animation?.cancel(),
  };
};

// =============================================================================
// ANIMATION PRESETS (Web Animations API format)
// =============================================================================
export const ANIMATION_PRESETS = {
  // Entrance animations
  fadeIn: {
    keyframes: [
      { opacity: 0 },
      { opacity: 1 },
    ],
    options: { duration: DURATIONS.normal, easing: EASINGS.easeOut, fill: 'forwards' as FillMode },
  },

  fadeInUp: {
    keyframes: [
      { opacity: 0, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    options: { duration: DURATIONS.slow, easing: EASINGS.smoothOut, fill: 'forwards' as FillMode },
  },

  fadeInScale: {
    keyframes: [
      { opacity: 0, transform: 'scale(0.95) translateY(16px)' },
      { opacity: 1, transform: 'scale(1) translateY(0)' },
    ],
    options: { duration: DURATIONS.entrance, easing: EASINGS.smoothOut, fill: 'forwards' as FillMode },
  },

  scaleIn: {
    keyframes: [
      { opacity: 0, transform: 'scale(0.97) translateY(12px)' },
      { opacity: 1, transform: 'scale(1) translateY(0)' },
    ],
    options: { duration: DURATIONS.slow, easing: EASINGS.smoothOut, fill: 'forwards' as FillMode },
  },

  // Modal animations
  modalOverlay: {
    keyframes: [
      { opacity: 0 },
      { opacity: 1 },
    ],
    options: { duration: DURATIONS.normal, easing: EASINGS.easeOut, fill: 'forwards' as FillMode },
  },

  modalCenter: {
    keyframes: [
      { opacity: 0, transform: 'scale(0.9) translateY(20px)' },
      { opacity: 1, transform: 'scale(1) translateY(0)' },
    ],
    options: { duration: DURATIONS.standard, easing: EASINGS.bounce, fill: 'forwards' as FillMode },
  },

  modalDropdown: {
    keyframes: [
      { opacity: 0, transform: 'translateY(-10px) scale(0.95)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ],
    options: { duration: DURATIONS.normal, easing: EASINGS.bounceMild, fill: 'forwards' as FillMode },
  },

  // Exit animations
  fadeOut: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    options: { duration: DURATIONS.fast, easing: EASINGS.easeOut, fill: 'forwards' as FillMode },
  },

  modalExit: {
    keyframes: [
      { opacity: 1, transform: 'scale(1) translateY(0)' },
      { opacity: 0, transform: 'scale(0.95) translateY(10px)' },
    ],
    options: { duration: DURATIONS.fast, easing: EASINGS.easeIn, fill: 'forwards' as FillMode },
  },

  // Card hover animations
  cardHoverIn: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.02)' },
    ],
    options: { duration: DURATIONS.fast, easing: EASINGS.smoothOut, fill: 'forwards' as FillMode },
  },

  cardHoverOut: {
    keyframes: [
      { transform: 'scale(1.02)' },
      { transform: 'scale(1)' },
    ],
    options: { duration: DURATIONS.instant, easing: EASINGS.easeOut, fill: 'forwards' as FillMode },
  },

  // Device reset animation
  deviceReset: {
    keyframes: [
      { transform: 'translate(0, 0) scale(0.85) rotate(0deg)', opacity: 1 },
    ],
    options: { duration: DURATIONS.fast, easing: EASINGS.easeOut, fill: 'forwards' as FillMode },
  },

  // Filter preview animation
  filterPreview: {
    keyframes: [
      { opacity: 0, transform: 'scale(0.5) translateY(4px)' },
      { opacity: 1, transform: 'scale(1) translateY(0)' },
    ],
    options: { duration: DURATIONS.quick, easing: EASINGS.easeOut, fill: 'forwards' as FillMode },
  },

  // Media fade in
  mediaFadeIn: {
    keyframes: [
      { opacity: 0, transform: 'scale(1.02)' },
      { opacity: 1, transform: 'scale(1)' },
    ],
    options: { duration: DURATIONS.quick, easing: EASINGS.easeOut, fill: 'forwards' as FillMode },
  },

  // Background crossfade
  backgroundFadeIn: {
    keyframes: [
      { opacity: 0 },
      { opacity: 1 },
    ],
    options: { duration: DURATIONS.normal, easing: EASINGS.easeOut, fill: 'forwards' as FillMode },
  },

  backgroundFadeOut: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    options: { duration: DURATIONS.normal, easing: EASINGS.easeOut, fill: 'forwards' as FillMode },
  },
} as const;

// =============================================================================
// LAYOUT PREVIEW ANIMATION CONFIGS
// =============================================================================
export const createLayoutAnimation = (
  type: string,
  intensity: number,
  duration: number,
  easing: string = EASINGS.easeOut
): AnimationConfig => {
  const easingValue = easing === 'linear' ? EASINGS.linear : EASINGS.easeOut;

  switch (type) {
    case 'float':
      return {
        keyframes: [
          { transform: 'translateY(0)' },
          { transform: `translateY(${-intensity}px)` },
          { transform: 'translateY(0)' },
        ],
        options: { duration, easing: EASINGS.sineInOut, iterations: Infinity },
      };

    case 'bounce':
      return {
        keyframes: [
          { transform: 'translateY(0)' },
          { transform: `translateY(${-intensity}px)` },
          { transform: 'translateY(0)' },
        ],
        options: { duration: duration / 2, easing: EASINGS.easeOut, iterations: Infinity },
      };

    case 'rotate':
      return {
        keyframes: [
          { transform: 'rotateY(0deg)' },
          { transform: `rotateY(${intensity}deg)` },
        ],
        options: { duration, easing: easingValue, iterations: Infinity },
      };

    case 'zoom':
    case 'zoom-in':
      return {
        keyframes: [
          { transform: 'scale(1)' },
          { transform: `scale(${intensity})` },
          { transform: 'scale(1)' },
        ],
        options: { duration, easing: EASINGS.easeInOut, iterations: Infinity },
      };

    case 'zoom-up':
      return {
        keyframes: [
          { transform: 'scale(0.7) translateY(30px)', opacity: 0 },
          { transform: 'scale(1) translateY(0)', opacity: 1 },
        ],
        options: { duration, easing: EASINGS.bounce, fill: 'forwards' as FillMode },
      };

    case 'zoom-down':
      return {
        keyframes: [
          { transform: 'scale(0.7) translateY(-30px)', opacity: 0 },
          { transform: 'scale(1) translateY(0)', opacity: 1 },
        ],
        options: { duration, easing: EASINGS.bounce, fill: 'forwards' as FillMode },
      };

    case 'zoom-out':
      return {
        keyframes: [
          { transform: 'scale(1.3)', opacity: 0.5 },
          { transform: 'scale(1)', opacity: 1 },
        ],
        options: { duration, easing: EASINGS.easeOut, fill: 'forwards' as FillMode },
      };

    case 'slide':
    case 'slide-right':
      return {
        keyframes: [
          { transform: `translateX(${intensity}px)`, opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 },
        ],
        options: { duration, easing: EASINGS.easeOut, fill: 'forwards' as FillMode },
      };

    case 'slide-left':
      return {
        keyframes: [
          { transform: `translateX(${-intensity}px)`, opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 },
        ],
        options: { duration, easing: EASINGS.easeOut, fill: 'forwards' as FillMode },
      };

    case 'slide-up':
      return {
        keyframes: [
          { transform: `translateY(${intensity}px)`, opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
        options: { duration, easing: EASINGS.easeOut, fill: 'forwards' as FillMode },
      };

    case 'slide-down':
      return {
        keyframes: [
          { transform: `translateY(${-intensity}px)`, opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
        options: { duration, easing: EASINGS.easeOut, fill: 'forwards' as FillMode },
      };

    case 'pulse':
      return {
        keyframes: [
          { transform: 'scale(1)' },
          { transform: `scale(${intensity})` },
          { transform: 'scale(1)' },
        ],
        options: { duration, easing: EASINGS.easeInOut, iterations: Infinity },
      };

    case 'swing':
      return {
        keyframes: [
          { transform: 'rotate(0deg)' },
          { transform: `rotate(${intensity}deg)` },
          { transform: 'rotate(0deg)' },
          { transform: `rotate(${-intensity}deg)` },
          { transform: 'rotate(0deg)' },
        ],
        options: { duration, easing: EASINGS.sineInOut, iterations: Infinity },
      };

    case 'shake':
      return {
        keyframes: [
          { transform: 'translateX(0)' },
          { transform: `translateX(${intensity}px)` },
          { transform: `translateX(${-intensity}px)` },
          { transform: `translateX(${intensity}px)` },
          { transform: `translateX(${-intensity}px)` },
          { transform: 'translateX(0)' },
        ],
        options: { duration, easing: 'linear', iterations: Infinity },
      };

    case 'spiral':
      return {
        keyframes: [
          { transform: `scale(0) rotate(${-intensity}deg)`, opacity: 0 },
          { transform: 'scale(1) rotate(0deg)', opacity: 1 },
        ],
        options: { duration, easing: EASINGS.bounce, fill: 'forwards' as FillMode },
      };

    case 'fan':
      return {
        keyframes: [
          { transform: `rotate(${-intensity}deg) scale(0.5)`, opacity: 0 },
          { transform: 'rotate(0deg) scale(1)', opacity: 1 },
        ],
        options: { duration, easing: EASINGS.bounceMild, fill: 'forwards' as FillMode },
      };

    case 'domino':
      return {
        keyframes: [
          { transform: 'perspective(500px) rotateX(-90deg) translateY(-20px)', opacity: 0 },
          { transform: 'perspective(500px) rotateX(0deg) translateY(0)', opacity: 1 },
        ],
        options: { duration, easing: EASINGS.bounceSubtle, fill: 'forwards' as FillMode },
      };

    case 'elastic-rotate':
      return {
        keyframes: [
          { transform: 'rotate(0deg)' },
          { transform: `rotate(${intensity}deg)` },
        ],
        options: { duration, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', iterations: Infinity, direction: 'alternate' },
      };

    case 'converge':
      return {
        keyframes: [
          { transform: `translate(${intensity}px, ${intensity}px) scale(0.8)`, opacity: 0 },
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        ],
        options: { duration, easing: EASINGS.smoothOut, fill: 'forwards' as FillMode },
      };

    case 'diverge':
      return {
        keyframes: [
          { transform: 'scale(0)', opacity: 0 },
          { transform: `scale(${1 + intensity/100})`, opacity: 1 },
        ],
        options: { duration, easing: EASINGS.smoothOut, fill: 'forwards' as FillMode },
      };

    case 'glitch':
      return {
        keyframes: [
          { transform: 'translate(0, 0)' },
          { transform: `translate(-${intensity}px, ${intensity}px)` },
          { transform: `translate(${intensity}px, -${intensity}px)` },
          { transform: 'translate(0, 0)' },
          { transform: `translate(${intensity}px, 0)` },
          { transform: `translate(0, -${intensity}px)` },
          { transform: 'translate(0, 0)' },
        ],
        options: { duration: duration / 2, easing: 'steps(2)', iterations: Infinity },
      };

    case 'wobble-3d':
      return {
        keyframes: [
          { transform: 'rotateX(0deg) rotateY(0deg)' },
          { transform: `rotateX(${intensity}deg) rotateY(-${intensity}deg)` },
          { transform: `rotateX(-${intensity}deg) rotateY(${intensity}deg)` },
          { transform: 'rotateX(0deg) rotateY(0deg)' },
        ],
        options: { duration, easing: EASINGS.sineInOut, iterations: Infinity },
      };

    case 'rotate-3d':
      return {
        keyframes: [
          { transform: 'rotate3d(1, 1, 1, 0deg)' },
          { transform: `rotate3d(1, 1, 1, ${intensity}deg)` },
          { transform: 'rotate3d(1, 1, 1, 0deg)' },
        ],
        options: { duration, easing: 'linear', iterations: Infinity },
      };

    case 'elevator':
      return {
        keyframes: [
          { transform: 'translateY(100%) scale(0.5)', opacity: 0 },
          { transform: 'translateY(0) scale(1)', opacity: 1 },
        ],
        options: { duration, easing: EASINGS.smoothOut, fill: 'forwards' as FillMode },
      };

    case 'skew-slide':
      return {
        keyframes: [
          { transform: `skewX(${intensity/2}deg) translateX(100%)`, opacity: 0 },
          { transform: 'skewX(0deg) translateX(0)', opacity: 1 },
        ],
        options: { duration, easing: EASINGS.smoothOut, fill: 'forwards' as FillMode },
      };

    default:
      return {
        keyframes: [{ opacity: 1 }],
        options: { duration: 0 },
      };
  }
};

// =============================================================================
// ANIMATION VALUE CALCULATOR (for progress-based animations)
// =============================================================================
export const calculateAnimationValue = (
  animationType: string,
  progress: number,
  intensity: number = 1,
  easing: string = 'ease-in-out'
): { transform: string; opacity?: number } => {
  const easedProgress = applyEasing(progress, easing);

  // For looping animations, use sin wave
  const loopProgress = Math.sin(easedProgress * Math.PI * 2);
  const halfLoopProgress = Math.sin(easedProgress * Math.PI);

  switch (animationType) {
    case 'float':
      return {
        transform: `translateY(${loopProgress * intensity * -1}px)`,
      };

    case 'bounce':
      const bounceY = Math.abs(Math.sin(easedProgress * Math.PI * 4)) * intensity;
      return {
        transform: `translateY(${-bounceY}px)`,
      };

    case 'rotate':
      return {
        transform: `rotateY(${easedProgress * intensity}deg)`,
      };

    case 'zoom-in':
    case 'zoom':
      const scale = 1 + halfLoopProgress * (intensity - 1);
      return {
        transform: `scale(${scale})`,
      };

    case 'zoom-out':
      const scaleOut = 1 - halfLoopProgress * (1 - 1 / intensity);
      return {
        transform: `scale(${scaleOut})`,
      };

    case 'slide-right':
    case 'slide':
      const slideX = (1 - easedProgress) * intensity;
      return {
        transform: `translateX(${slideX}px)`,
        opacity: easedProgress,
      };

    case 'slide-left':
      const slideXLeft = (easedProgress - 1) * intensity;
      return {
        transform: `translateX(${slideXLeft}px)`,
        opacity: easedProgress,
      };

    case 'slide-up':
      const slideYUp = (1 - easedProgress) * intensity;
      return {
        transform: `translateY(${slideYUp}px)`,
        opacity: easedProgress,
      };

    case 'slide-down':
      const slideYDown = (easedProgress - 1) * intensity;
      return {
        transform: `translateY(${slideYDown}px)`,
        opacity: easedProgress,
      };

    case 'zoom-up':
      const zoomUpScale = 0.7 + easedProgress * 0.3;
      const zoomUpY = (1 - easedProgress) * 30;
      return {
        transform: `scale(${zoomUpScale}) translateY(${zoomUpY}px)`,
        opacity: easedProgress,
      };

    case 'zoom-down':
      const zoomDownScale = 0.7 + easedProgress * 0.3;
      const zoomDownY = (easedProgress - 1) * 30;
      return {
        transform: `scale(${zoomDownScale}) translateY(${zoomDownY}px)`,
        opacity: easedProgress,
      };

    case 'pulse':
      const pulseScale = 1 + Math.sin(easedProgress * Math.PI * 4) * (intensity - 1) * 0.5;
      return {
        transform: `scale(${pulseScale})`,
      };

    case 'shake':
      const shakeX = Math.sin(easedProgress * Math.PI * 20) * intensity;
      return {
        transform: `translateX(${shakeX}px)`,
      };

    case 'swing':
      const swingAngle = loopProgress * intensity;
      return {
        transform: `rotate(${swingAngle}deg)`,
      };

    case 'spiral':
      const spiralScale = easedProgress;
      const spiralRotation = (1 - easedProgress) * -intensity;
      return {
        transform: `scale(${spiralScale}) rotate(${spiralRotation}deg)`,
        opacity: easedProgress,
      };

    case 'fan':
      const fanRotation = (1 - easedProgress) * -intensity;
      const fanScale = 0.5 + easedProgress * 0.5;
      return {
        transform: `rotate(${fanRotation}deg) scale(${fanScale})`,
        opacity: easedProgress,
      };

    case 'domino':
      const dominoRotateX = (1 - easedProgress) * -90;
      const dominoY = (1 - easedProgress) * -20;
      return {
        transform: `perspective(500px) rotateX(${dominoRotateX}deg) translateY(${dominoY}px)`,
        opacity: easedProgress,
      };

    case 'elastic-rotate':
      // Oscillate rotation
      const elasticRot = Math.sin(easedProgress * Math.PI * 2) * intensity;
      return {
        transform: `rotate(${elasticRot}deg)`,
      };

    case 'converge':
      const convInv = 1 - easedProgress;
      const convScale = 0.8 + easedProgress * 0.2;
      return {
        transform: `translate(${convInv * intensity}px, ${convInv * intensity}px) scale(${convScale})`,
        opacity: easedProgress,
      };

    case 'diverge':
      return {
        transform: `scale(${(1 + intensity / 100) * easedProgress})`,
        opacity: easedProgress,
      };

    case 'glitch':
      // Random-like steps based on progress
      // Use sine waves at different frequencies to simulate randomness
      const gX = Math.floor(Math.sin(easedProgress * 50) * 2) * intensity / 2;
      const gY = Math.floor(Math.cos(easedProgress * 40) * 2) * intensity / 2;
      return {
        transform: `translate(${gX}px, ${gY}px)`,
      };

    case 'wobble-3d':
      // Use progress directly to ensure continuous movement
      const wRotX = Math.sin(easedProgress * Math.PI * 2) * intensity;
      const wRotY = Math.cos(easedProgress * Math.PI * 2) * intensity;
      return {
        transform: `rotateX(${wRotX}deg) rotateY(${wRotY}deg)`,
      };

    case 'rotate-3d':
      return {
        transform: `rotate3d(1, 1, 1, ${easedProgress * intensity}deg)`,
      };

    case 'elevator':
      const elevY = (1 - easedProgress) * 100;
      const elevScale = 0.5 + easedProgress * 0.5;
      return {
        transform: `translateY(${elevY}%) scale(${elevScale})`,
        opacity: easedProgress,
      };

    case 'skew-slide':
      const skewXVal = (1 - easedProgress) * (intensity / 2);
      const slideXVal = (1 - easedProgress) * 100;
      return {
        transform: `skewX(${skewXVal}deg) translateX(${slideXVal}%)`,
        opacity: easedProgress,
      };

    default:
      return { transform: 'none' };
  }
};

// =============================================================================
// COMBINE MULTIPLE ANIMATIONS (with caching for performance)
// =============================================================================
const animationCache = new Map<string, { transform: string; opacity?: number }>();
const MAX_CACHE_SIZE = 500;

export const combineAnimations = (
  animations: { type: string; intensity?: number }[],
  progress: number,
  easing: string
): { transform: string; opacity?: number } => {
  // Round progress to 3 decimals for better cache hit rate
  const roundedProgress = Math.round(progress * 1000) / 1000;

  // Create cache key
  const animKey = animations.map(a => `${a.type}:${a.intensity ?? ''}`).join('|');
  const cacheKey = `${animKey}-${roundedProgress}-${easing}`;

  // Check cache
  const cached = animationCache.get(cacheKey);
  if (cached) return cached;

  // Clear cache if too large
  if (animationCache.size > MAX_CACHE_SIZE) {
    animationCache.clear();
  }

  // Calculate result
  const transforms: string[] = [];
  let opacity: number | undefined;

  animations.forEach((anim) => {
    const result = calculateAnimationValue(
      anim.type,
      roundedProgress,
      anim.intensity || getDefaultIntensity(anim.type),
      easing
    );

    if (result.transform !== 'none') {
      transforms.push(result.transform);
    }
    if (result.opacity !== undefined) {
      opacity = result.opacity;
    }
  });

  const result = {
    transform: transforms.length > 0 ? transforms.join(' ') : 'none',
    opacity,
  };

  // Store in cache
  animationCache.set(cacheKey, result);

  return result;
};

// =============================================================================
// STAGGER CALCULATION
// =============================================================================
export const STAGGER_DEFAULTS = {
  cards: 40,
  filters: 60,
  images: 150,
} as const;

// Helper to animate elements with stagger
export const animateStaggered = (
  elements: Element[],
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
  staggerMs: number = STAGGER_DEFAULTS.cards
): Animation[] => {
  return elements.map((el, i) => {
    return el.animate(keyframes, {
      ...options,
      delay: (options.delay as number || 0) + i * staggerMs,
    });
  });
};
