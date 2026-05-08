import type { Config } from 'tailwindcss';

// Wigope brand tokens — keep in sync with mobile/lib/app/theme/colors.dart and docs/BRAND.md.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        wigope: {
          orange: {
            50: '#FFF4ED',
            400: '#FFA968',
            500: '#FF8A3D',
            600: '#F97316',
          },
          navy: {
            700: '#1F3050',
            800: '#142238',
            900: '#0A1628',
          },
        },
        surface: {
          base: '#FFFFFF',
          soft: '#FAFBFC',
          card: '#FFFFFF',
          muted: '#F4F5F8',
        },
        border: {
          soft: '#E8EAF0',
          DEFAULT: '#D5D9E2',
        },
        ink: {
          primary: '#0A1628',
          secondary: '#4A5670',
          tertiary: '#8089A0',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      borderRadius: {
        chip: '12px',
        card: '16px',
        hero: '24px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(10, 22, 40, 0.04)',
        hero: '0 8px 24px rgba(249, 115, 22, 0.12)',
        sheet: '0 -8px 32px rgba(10, 22, 40, 0.08)',
      },
      backgroundImage: {
        'grad-orange': 'linear-gradient(135deg, #F97316 0%, #FF6A00 100%)',
        'grad-orange-soft': 'linear-gradient(135deg, #FFF4ED 0%, #FFE4D1 100%)',
        'grad-navy': 'linear-gradient(135deg, #0A1628 0%, #1F3050 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
