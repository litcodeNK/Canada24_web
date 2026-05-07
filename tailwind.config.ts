import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#D52B1E',
        'primary-dark': '#FF453A',
        canada: {
          red: '#D52B1E',
          black: '#1A1A1A',
        },
      },
      fontFamily: {
        bebas: ['var(--font-bebas)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
