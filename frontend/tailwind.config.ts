import type { Config } from 'tailwindcss';

const config: Config = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#07060D',
          surface: '#0F0D1A',
          elevated: '#1A1730',
        },
        brand: {
          900: '#2E1065',
          700: '#6D28D9',
          600: '#7C3AED',
          500: '#8B5CF6',
          400: '#9F67FA',
          300: '#C4B5FD',
          200: '#DDD6FE',
        },
        accent: {
          cyan: '#22D3EE',
          'cyan-light': '#67E8F9',
        },
        text: {
          primary: '#E8E6F0',
          secondary: '#9E97C0',
          muted: '#6B648A',
          disabled: '#3D3858',
        },
        border: {
          subtle: 'rgba(138, 92, 246, 0.10)',
          default: 'rgba(138, 92, 246, 0.18)',
          strong: 'rgba(138, 92, 246, 0.35)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Orbitron', 'monospace'],
        body: ['var(--font-body)', 'Space Grotesk', 'sans-serif'],
        sans: ['var(--font-body)', 'Space Grotesk', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'Noto Sans Arabic', 'sans-serif'],
      },
      backgroundImage: {
        'glow-purple':
          'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.25) 0%, transparent 60%)',
        'glow-purple-lg':
          'radial-gradient(ellipse at 50% -20%, rgba(124,58,237,0.35) 0%, transparent 65%)',
        'hero-grid':
          'linear-gradient(rgba(138,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(138,92,246,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-40': '40px 40px',
      },
      boxShadow: {
        'glow-purple': '0 0 24px rgba(124, 58, 237, 0.40)',
        'glow-purple-sm': '0 0 12px rgba(124, 58, 237, 0.30)',
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.30)',
        card: '0 4px 32px rgba(0, 0, 0, 0.50)',
        'card-hover': '0 8px 48px rgba(0, 0, 0, 0.70)',
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124,58,237,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(124,58,237,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
