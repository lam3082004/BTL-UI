import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design System Colors
        bg: '#F0F7F7',
        'bg-light': '#FFFFFF',
        teal: '#5BBFB5',
        peach: '#F9A870',
        blue: '#A8D8EA',
        green: '#B8E0B0',
        pink: '#F4B8C8',
        yellow: '#FFD166',
        text: '#2D3436',
        // Legacy primary/secondary (for compatibility)
        primary: '#5BBFB5', // teal
        secondary: '#F9A870', // peach
        accent: '#F0F7F7', // light mint background
        success: '#95D5B2', // soft green
        warning: '#FFB4B4', // soft red
      },
      fontFamily: {
        display: ['Nunito', 'Baloo 2', 'sans-serif'],
      },
      minWidth: {
        touch: '64px',
      },
      minHeight: {
        touch: '64px',
      },
      borderRadius: {
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 16px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
