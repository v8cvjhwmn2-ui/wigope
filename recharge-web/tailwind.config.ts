import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#071225',
          900: '#0b172a',
          800: '#15233a',
          700: '#24344f'
        },
        wigope: {
          orange: '#ff6b13',
          orangeDark: '#e95406',
          peach: '#fff2ea',
          line: '#e5eaf3'
        }
      },
      boxShadow: {
        card: '0 18px 50px rgba(9, 23, 48, 0.08)',
        dock: '0 -14px 38px rgba(15, 23, 42, 0.08)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
