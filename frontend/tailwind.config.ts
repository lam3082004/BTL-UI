import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5BBFB5', // teal
        secondary: '#FFD89B', // peach
        accent: '#FFF5D6', // pale yellow
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
    },
  },
  plugins: [],
};

export default config;
