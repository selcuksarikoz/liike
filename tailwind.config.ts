import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#d4ff3f',
        primary: '#1c3b4a',
        'background-light': '#f6f7f8',
        'background-dark': '#141b1e',
        'panel-dark': '#1c2529',
        'border-dark': '#2c393f',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
