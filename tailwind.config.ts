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
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-3px)' },
          '75%': { transform: 'translateX(3px)' },
        },
        zoomIn: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.15)' },
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
      },
      animation: {
        float: 'float 2s ease-in-out infinite',
        shake: 'shake 0.4s linear infinite',
        'zoom-pulse': 'zoomIn 1s ease-in-out infinite alternate',
        glitch: 'glitch 0.3s linear infinite',
        swing: 'swing 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
