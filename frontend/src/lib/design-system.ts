export const COLORS = {
  // Backgrounds
  bgBase: '#07060D', // deepest background — page root
  bgSurface: '#0F0D1A', // cards, sidebars
  bgElevated: '#1A1730', // modals, dropdowns, hover states
  bgGlass: 'rgba(138, 92, 246, 0.07)', // glassmorphism fill

  // Purple brand ramp
  purple900: '#2E1065',
  purple700: '#6D28D9',
  purple600: '#7C3AED', // PRIMARY brand color
  purple500: '#8B5CF6',
  purple400: '#9F67FA',
  purple300: '#C4B5FD',
  purple200: '#DDD6FE',

  // Cyan accent (used sparingly — CTA highlights, electric badge)
  cyan400: '#22D3EE',
  cyan300: '#67E8F9',

  // Text
  textPrimary: '#E8E6F0',
  textSecondary: '#9E97C0',
  textMuted: '#6B648A',
  textDisabled: '#3D3858',

  // Borders
  borderSubtle: 'rgba(138, 92, 246, 0.10)',
  borderDefault: 'rgba(138, 92, 246, 0.18)',
  borderStrong: 'rgba(138, 92, 246, 0.35)',

  // Semantic
  success: '#34D399',
  successBg: 'rgba(52, 211, 153, 0.10)',
  warning: '#FBBF24',
  warningBg: 'rgba(251, 191, 36, 0.10)',
  danger: '#F87171',
  dangerBg: 'rgba(248, 113, 113, 0.10)',
  info: '#60A5FA',
  infoBg: 'rgba(96, 165, 250, 0.10)',
} as const;

export const FONTS = {
  display: "'Orbitron', monospace", // headings, logo, prices
  body: "'Space Grotesk', sans-serif", // all body text, UI
} as const;

export const SHADOWS = {
  glowPurple: '0 0 24px rgba(124, 58, 237, 0.40)',
  glowPurpleSm: '0 0 12px rgba(124, 58, 237, 0.30)',
  glowCyan: '0 0 20px rgba(34, 211, 238, 0.30)',
  card: '0 4px 32px rgba(0, 0, 0, 0.50)',
  cardHover: '0 8px 48px rgba(0, 0, 0, 0.70)',
} as const;

export const TRANSITIONS = {
  fast: 'all 0.15s ease',
  default: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const BLUR = {
  glass: 'blur(16px)',
  glassSm: 'blur(8px)',
  glassLg: 'blur(24px)',
} as const;
