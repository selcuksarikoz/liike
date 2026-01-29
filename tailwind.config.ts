import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
            DEFAULT: '#d4ff3f',
            hover: '#c2eb30',
        },
        primary: '#1c3b4a',
        ui: {
            bg: '#141b1e',
            panel: '#1c2529',
            border: '#2c393f',
            muted: '#9fb2bc',
            highlight: '#1c3b4a',
        },
        canvas: '#111618',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideLeft: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-6px)' },
        },
        slideRight: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(6px)' },
        },
        slideUp: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideDown: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-3px)' },
          '75%': { transform: 'translateX(3px)' },
        },
        zoomIn: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.15)' },
        },
        zoomOut: {
          '0%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(0.92)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': { transform: 'translate(-2px, -2px)' },
          '80%': { transform: 'translate(2px, 2px)' },
        },
        swing: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        elasticRotate: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '40%': { transform: 'rotate(6deg) scale(1.08)' },
          '70%': { transform: 'rotate(-4deg) scale(0.98)' },
          '100%': { transform: 'rotate(0deg) scale(1)' },
        },
        wobble3d: {
          '0%, 100%': { transform: 'rotateY(0deg) rotateX(0deg)' },
          '50%': { transform: 'rotateY(10deg) rotateX(-6deg)' },
        },
        rotate3d: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        elevator: {
          '0%': { transform: 'translateY(6px) scale(0.98)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        skewSlide: {
          '0%': { transform: 'translateX(-4px) skewX(-4deg)' },
          '100%': { transform: 'translateX(0) skewX(0deg)' },
        },
        converge: {
          '0%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        diverge: {
          '0%': { transform: 'scale(0.92)' },
          '100%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        float: 'float 2s ease-in-out infinite',
        'slide-left': 'slideLeft 1s ease-in-out infinite',
        'slide-right': 'slideRight 1s ease-in-out infinite',
        'slide-up': 'slideUp 1s ease-in-out infinite',
        'slide-down': 'slideDown 1s ease-in-out infinite',
        shake: 'shake 0.4s linear infinite',
        'zoom-pulse': 'zoomIn 1s ease-in-out infinite alternate',
        'zoom-out-pulse': 'zoomOut 1s ease-in-out infinite alternate',
        glitch: 'glitch 0.3s linear infinite',
        swing: 'swing 1s ease-in-out infinite',
        'elastic-rotate': 'elasticRotate 1s ease-in-out infinite',
        'wobble-3d': 'wobble3d 1.2s ease-in-out infinite',
        'rotate-3d': 'rotate3d 1.2s linear infinite',
        elevator: 'elevator 0.9s ease-out infinite',
        'skew-slide': 'skewSlide 0.8s ease-in-out infinite',
        converge: 'converge 0.9s ease-in-out infinite',
        diverge: 'diverge 0.9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
