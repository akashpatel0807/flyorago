export const Theme = {
  colors: {
    // Brand Colors matched from new UI design
    navy: '#0B1527',
    'navy-light': '#1A2942',
    'navy-medium': '#121F38',
    blue: '#1B4FD8',
    'blue-light': '#2563EB',
    'blue-muted': '#3B6FE8',
    teal: '#28806A',
    'teal-light': '#489A86',
    'teal-bright': '#34A88C',
    'teal-dark': '#1C5B4C',
    white: '#FFFFFF',
    'off-white': '#F5F9F8',
    'gray-50': '#F9FAFB',
    'gray-100': '#F3F4F6',
    'gray-200': '#E5E7EB',
    'gray-300': '#D1D5DB',
    'gray-500': '#6B7280',
    'gray-600': '#4B5563',
    'gray-700': '#374151',
    'gray-900': '#111827',
  },
  typography: {
    hero: { fontSize: 48, lineHeight: 52, letterSpacing: -1, fontFamily: 'Poppins_800ExtraBold' },
    display: { fontSize: 40, lineHeight: 46, letterSpacing: -0.5, fontFamily: 'Poppins_700Bold' },
    h1: { fontSize: 32, lineHeight: 40, letterSpacing: -0.5, fontFamily: 'Poppins_700Bold' },
    h2: { fontSize: 24, lineHeight: 32, letterSpacing: -0.5, fontFamily: 'Poppins_700Bold' },
    h3: { fontSize: 20, lineHeight: 28, fontFamily: 'Poppins_600SemiBold' },
    body: { fontSize: 16, lineHeight: 24, fontFamily: 'Poppins_400Regular' },
    bodyMedium: { fontSize: 16, lineHeight: 24, fontFamily: 'Poppins_500Medium' },
    bodySmall: { fontSize: 14, lineHeight: 20, fontFamily: 'Poppins_400Regular' },
    caption: { fontSize: 12, lineHeight: 16, fontFamily: 'Poppins_400Regular' },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    '3xl': 32,
  },
};

// Legacy exports to prevent breaking existing screens until updated
export const Colors = {
  light: {
    text: '#111827',
    textSecondary: '#6B7280',
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    primary: '#0D9488',
    primaryDark: '#0F766E',
    accent: '#2563EB',
    border: '#E5E7EB',
    card: '#FFFFFF',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    navy: '#0A1628',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#0A1628', // Use navy as dark background
    backgroundSecondary: '#1a2d4f',
    primary: '#14B8A6',
    primaryDark: '#0D9488',
    accent: '#3B82F6',
    border: '#1F2937',
    card: '#162040',
    success: '#10B981',
    error: '#F87171',
    warning: '#FBBF24',
    navy: '#FFFFFF', // Invert navy text
  },
};

export const Spacing = {
  zero: 0,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 40,
  eight: 48,
};

export const Radius = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};
