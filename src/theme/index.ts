export const Colors = {
  light: {
    primary: '#1976D2',
    onPrimary: '#F5F5F5',
    secondary: '#000000',
    onSecondary: '#F5F5F5',
    accent: '#F5F5F5',
    background: '#EAE7DC',
    surface: '#EAE7DC',
    onSurface: '#000000',
    primaryText: '#000000',
    secondaryText: '#000000',
    hint: 'rgba(0,0,0,0.5)',
    error: '#D32F2F',
    divider: '#000000',
    transparent: 'transparent',
  },
  dark: {
    primary: '#42A5F5',
    onPrimary: '#F5F5F5',
    secondary: '#F5F5F5',
    onSecondary: '#000000',
    accent: '#42A5F5',
    background: '#000000',
    surface: '#1A1A1A',
    onSurface: '#F5F5F5',
    primaryText: '#F5F5F5',
    secondaryText: '#EAE7DC',
    hint: 'rgba(245,245,245,0.5)',
    error: '#FF0000',
    divider: '#F5F5F5',
    transparent: 'transparent',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 32,
  xl: 64,
};

export const Fonts = {
  bebasNeue: 'BebasNeue_400Regular',
  interRegular: 'System',
  interBold: 'System',
};

export const TextStyles = {
  headlineLarge: { fontSize: 34, fontWeight: '700' as const, lineHeight: 34 },
  headlineMedium: { fontSize: 28, fontWeight: '700' as const, lineHeight: 28 },
  headlineSmall: { fontSize: 22, fontWeight: '700' as const, lineHeight: 24 },
  titleLarge: { fontSize: 22, fontWeight: '700' as const, lineHeight: 24 },
  titleMedium: { fontSize: 17, fontWeight: '700' as const, lineHeight: 19 },
  bodyLarge: { fontSize: 17, fontWeight: '700' as const, lineHeight: 20 },
  bodyMedium: { fontSize: 15, fontWeight: '700' as const, lineHeight: 18 },
  bodySmall: { fontSize: 13, fontWeight: '700' as const, lineHeight: 16 },
  labelLarge: { fontSize: 15, fontWeight: '700' as const, lineHeight: 15 },
  labelMedium: { fontSize: 13, fontWeight: '700' as const, lineHeight: 13 },
  labelSmall: { fontSize: 11, fontWeight: '700' as const, lineHeight: 11 },
};
