import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canadaRed: '#D52B1E',
        canadaRedDark: '#A81F15',
        navy: '#0C1F3F',
        primary: '#D52B1E',
        'primary-dark': '#FF453A',
        canada: {
          red: '#D52B1E',
          black: '#1A1A1A',
        },
        blue: {
          500: '#2D6FE0',
          600: '#1A66E5',
        },
        red: {
          600: '#E0162B',
        },
        yellow: {
          400: '#F2C94C',
        },
        gray: {
          300: '#D7D7D7',
          800: '#2A2A2A',
          900: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', '"Source Serif 4"', 'Georgia', 'serif'],
        display: ['"Arial Black"', 'Impact', 'var(--font-inter)', 'sans-serif'],
        bebas: ['var(--font-bebas)', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
