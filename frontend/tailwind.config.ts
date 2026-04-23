import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        hair: '0 1px 2px rgba(15,23,42,0.06)',
        card: '0 12px 30px -20px rgba(15,23,42,0.15)',
        pop: '0 20px 50px -20px rgba(15,23,42,0.25)',
        cta: '0 1px 2px rgba(15,23,42,0.08), 0 8px 24px -6px rgba(79,70,229,0.25)',
      },
    },
  },
  plugins: [],
};
export default config;
