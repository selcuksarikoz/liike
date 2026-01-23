// Text Animation Definitions
// Creative text reveal effects for combining with device mockups

export type TextAnimationType = 
  | 'typewriter'
  | 'word-fade-in'
  | 'letter-cascade'
  | 'word-slide-up'
  | 'glow-reveal'
  | 'bounce-letters'
  | 'blur-in'
  | 'scale-pop'
  | 'split-reveal';

export type TextPosition = 'top' | 'center' | 'bottom';

export type TextAnimationConfig = {
  id: TextAnimationType;
  name: string;
  description: string;
  defaultDuration: number; // ms
  charDelay?: number; // ms between characters
  wordDelay?: number; // ms between words
  easing: string;
  icon: string;
  category: 'reveal' | 'dynamic' | 'elegant';
};

export const TEXT_ANIMATIONS: TextAnimationConfig[] = [
  {
    id: 'typewriter',
    name: 'Typewriter',
    description: 'Characters appear one by one like typing',
    defaultDuration: 2000,
    charDelay: 50,
    easing: 'linear',
    icon: '⌨️',
    category: 'reveal',
  },
  {
    id: 'word-fade-in',
    name: 'Word Fade',
    description: 'Words fade in sequentially',
    defaultDuration: 2500,
    wordDelay: 200,
    easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
    icon: '✨',
    category: 'elegant',
  },
  {
    id: 'letter-cascade',
    name: 'Letter Cascade',
    description: 'Letters cascade down from top',
    defaultDuration: 1500,
    charDelay: 30,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    icon: '🌊',
    category: 'dynamic',
  },
  {
    id: 'word-slide-up',
    name: 'Slide Up',
    description: 'Words slide up into view',
    defaultDuration: 2000,
    wordDelay: 150,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    icon: '⬆️',
    category: 'reveal',
  },
  {
    id: 'glow-reveal',
    name: 'Glow Reveal',
    description: 'Text glows as it appears',
    defaultDuration: 1800,
    easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
    icon: '💫',
    category: 'elegant',
  },
  {
    id: 'bounce-letters',
    name: 'Bounce',
    description: 'Letters bounce in playfully',
    defaultDuration: 1500,
    charDelay: 40,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    icon: '🏀',
    category: 'dynamic',
  },
  {
    id: 'blur-in',
    name: 'Blur In',
    description: 'Text comes into focus from blur',
    defaultDuration: 1200,
    easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
    icon: '🔍',
    category: 'elegant',
  },
  {
    id: 'scale-pop',
    name: 'Scale Pop',
    description: 'Text pops in with scale effect',
    defaultDuration: 800,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    icon: '💥',
    category: 'dynamic',
  },
  {
    id: 'split-reveal',
    name: 'Split Reveal',
    description: 'Text splits and reveals from center',
    defaultDuration: 1500,
    easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
    icon: '↔️',
    category: 'elegant',
  },
];

// Text + Device Combination Presets
export type TextDeviceLayout = 
  | 'text-top-device-bottom'     // Text at top, device at bottom
  | 'text-bottom-device-top'     // Text at bottom, device at top
  | 'text-left-device-right'     // Text on left, device on right
  | 'text-right-device-left'     // Text on right, device on left
  | 'text-center-device-behind'  // Text centered over device
  | 'text-overlay'               // Text overlaid on device screen
  | 'text-split-device-center';  // Text split across top/bottom, device in middle

export type TextDevicePreset = {
  id: string;
  name: string;
  description: string;
  textAnimation: TextAnimationType;
  textPosition: TextPosition;
  devicePosition: 'bottom' | 'center' | 'side' | 'top';
  layout: TextDeviceLayout;
  defaultText: string;
  durationMs: number;
  color: string;
  icon: string;
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  deviceScale?: number; // 0.5-1.0
};

export const TEXT_DEVICE_PRESETS: TextDevicePreset[] = [
  {
    id: 'headline-device',
    name: 'Headline + Device',
    description: 'Bold headline reveals above device mockup',
    textAnimation: 'scale-pop',
    textPosition: 'top',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    defaultText: 'Introducing the Future',
    durationMs: 3000,
    color: '#6366f1',
    icon: '📱',
    fontSize: 'xlarge',
    deviceScale: 0.7,
  },
  {
    id: 'typewriter-showcase',
    name: 'Typewriter Showcase',
    description: 'Text types above centered device',
    textAnimation: 'typewriter',
    textPosition: 'top',
    devicePosition: 'center',
    layout: 'text-top-device-bottom',
    defaultText: 'Built for creators.',
    durationMs: 4000,
    color: '#8b5cf6',
    icon: '⌨️',
    fontSize: 'large',
    deviceScale: 0.65,
  },
  {
    id: 'fade-words-reveal',
    name: 'Word Reveal',
    description: 'Words fade in one by one with device below',
    textAnimation: 'word-fade-in',
    textPosition: 'top',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    defaultText: 'Simple. Powerful. Yours.',
    durationMs: 3500,
    color: '#ec4899',
    icon: '✨',
    fontSize: 'large',
    deviceScale: 0.7,
  },
  {
    id: 'bounce-intro',
    name: 'Playful Intro',
    description: 'Letters bounce in with device animation',
    textAnimation: 'bounce-letters',
    textPosition: 'top',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    defaultText: 'Let\'s Go!',
    durationMs: 2500,
    color: '#f59e0b',
    icon: '🎉',
    fontSize: 'xlarge',
    deviceScale: 0.65,
  },
  {
    id: 'elegant-reveal',
    name: 'Elegant Reveal',
    description: 'Sophisticated blur-in text with device',
    textAnimation: 'blur-in',
    textPosition: 'center',
    devicePosition: 'bottom',
    layout: 'text-center-device-behind',
    defaultText: 'Experience Perfection',
    durationMs: 3000,
    color: '#14b8a6',
    icon: '💎',
    fontSize: 'xlarge',
    deviceScale: 0.8,
  },
  {
    id: 'slide-feature',
    name: 'Feature Slide',
    description: 'Words slide up to highlight features',
    textAnimation: 'word-slide-up',
    textPosition: 'top',
    devicePosition: 'bottom',
    layout: 'text-top-device-bottom',
    defaultText: 'Fast. Reliable. Secure.',
    durationMs: 3500,
    color: '#3b82f6',
    icon: '⚡',
    fontSize: 'large',
    deviceScale: 0.7,
  },
  // NEW: Side layouts
  {
    id: 'side-by-side-text-left',
    name: 'Text Left',
    description: 'Text on left, device on right side',
    textAnimation: 'word-fade-in',
    textPosition: 'center',
    devicePosition: 'side',
    layout: 'text-left-device-right',
    defaultText: 'Designed\nfor\nCreativity',
    durationMs: 3500,
    color: '#8b5cf6',
    icon: '◀️',
    fontSize: 'large',
    deviceScale: 0.6,
  },
  {
    id: 'side-by-side-text-right',
    name: 'Text Right',
    description: 'Device on left, text on right side',
    textAnimation: 'letter-cascade',
    textPosition: 'center',
    devicePosition: 'side',
    layout: 'text-right-device-left',
    defaultText: 'Your Story\nYour Way',
    durationMs: 3000,
    color: '#10b981',
    icon: '▶️',
    fontSize: 'large',
    deviceScale: 0.6,
  },
  // NEW: Inverted layouts
  {
    id: 'device-top-text-bottom',
    name: 'Device Top',
    description: 'Device at top, text reveals below',
    textAnimation: 'word-slide-up',
    textPosition: 'bottom',
    devicePosition: 'top',
    layout: 'text-bottom-device-top',
    defaultText: 'Download Now',
    durationMs: 2500,
    color: '#ef4444',
    icon: '⬆️',
    fontSize: 'xlarge',
    deviceScale: 0.65,
  },
  // NEW: Overlay style
  {
    id: 'text-overlay-glow',
    name: 'Overlay Glow',
    description: 'Glowing text over the device',
    textAnimation: 'glow-reveal',
    textPosition: 'center',
    devicePosition: 'center',
    layout: 'text-overlay',
    defaultText: 'NEW',
    durationMs: 2000,
    color: '#fbbf24',
    icon: '🌟',
    fontSize: 'xlarge',
    deviceScale: 0.75,
  },
  // NEW: Split layout
  {
    id: 'split-headline',
    name: 'Split Headline',
    description: 'Text splits around centered device',
    textAnimation: 'split-reveal',
    textPosition: 'center',
    devicePosition: 'center',
    layout: 'text-split-device-center',
    defaultText: 'POWER & STYLE',
    durationMs: 3000,
    color: '#a855f7',
    icon: '↔️',
    fontSize: 'xlarge',
    deviceScale: 0.6,
  },
  // NEW: App promo style
  {
    id: 'app-promo',
    name: 'App Promo',
    description: 'Classic app store promo style',
    textAnimation: 'scale-pop',
    textPosition: 'bottom',
    devicePosition: 'top',
    layout: 'text-bottom-device-top',
    defaultText: 'Available on App Store',
    durationMs: 2500,
    color: '#0ea5e9',
    icon: '📲',
    fontSize: 'medium',
    deviceScale: 0.7,
  },
];

// Generate CSS keyframes for each animation
export const generateTextKeyframes = (
  type: TextAnimationType, 
  progress: number, // 0-1
  charIndex: number = 0,
  totalChars: number = 1,
): { opacity: number; transform: string; filter?: string } => {
  const charProgress = Math.max(0, Math.min(1, 
    (progress * totalChars - charIndex) / 0.5
  ));
  
  switch (type) {
    case 'typewriter':
      return {
        opacity: charProgress > 0 ? 1 : 0,
        transform: 'none',
      };
      
    case 'word-fade-in':
      return {
        opacity: charProgress,
        transform: `translateY(${(1 - charProgress) * 10}px)`,
      };
      
    case 'letter-cascade':
      return {
        opacity: charProgress,
        transform: `translateY(${(1 - charProgress) * -30}px)`,
      };
      
    case 'word-slide-up':
      return {
        opacity: charProgress,
        transform: `translateY(${(1 - charProgress) * 40}px)`,
      };
      
    case 'glow-reveal':
      return {
        opacity: charProgress,
        transform: 'none',
        filter: `brightness(${1 + (1 - charProgress) * 2})`,
      };
      
    case 'bounce-letters':
      const bounceY = charProgress < 0.5 
        ? (1 - charProgress * 2) * -30 
        : (charProgress - 0.5) * 0.5 * 30;
      return {
        opacity: charProgress,
        transform: `translateY(${bounceY}px) scale(${0.5 + charProgress * 0.5})`,
      };
      
    case 'blur-in':
      return {
        opacity: charProgress,
        transform: `scale(${0.95 + charProgress * 0.05})`,
        filter: `blur(${(1 - charProgress) * 8}px)`,
      };
      
    case 'scale-pop':
      const scale = charProgress < 0.5 
        ? 0.3 + charProgress * 1.4 
        : 1.0 + (1 - charProgress) * 0.2;
      return {
        opacity: charProgress,
        transform: `scale(${scale})`,
      };
      
    case 'split-reveal':
      const offset = (1 - charProgress) * (charIndex % 2 === 0 ? -50 : 50);
      return {
        opacity: charProgress,
        transform: `translateX(${offset}px)`,
      };
      
    default:
      return { opacity: 1, transform: 'none' };
  }
};
