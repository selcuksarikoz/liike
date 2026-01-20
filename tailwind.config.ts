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
    },
  },
  plugins: [],
} satisfies Config;
