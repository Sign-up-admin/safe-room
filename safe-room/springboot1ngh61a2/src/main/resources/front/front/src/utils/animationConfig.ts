export const animationConfig = {
  durations: {
    fast: 0.25,
    base: 0.4,
    slow: 0.55,
  },
  ease: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    swiftOut: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  },
  colors: {
    background: '#0A0A0A',
    surface: '#1A1A1A',
    energy: ['#FDD835', '#F6C300', '#FFEA00'],
    glow: 'rgba(253, 216, 53, 0.45)',
    textPrimary: '#FFFFFF',
    textSecondary: '#9EA1A6',
  },
  hover: {
    lift: 'translateY(-4px)',
    glow: '0 0 24px rgba(253, 216, 53, 0.35)',
  },
}

export const breakpoints = {
  desktop: 1200,
  tablet: 960,
  mobile: 768,
}
