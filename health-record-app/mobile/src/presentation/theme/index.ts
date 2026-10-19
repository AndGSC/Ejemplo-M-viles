import { DefaultTheme, Theme } from '@react-navigation/native';

// Paleta de colores de la app (tonos clínicos: azul institucional y verde azulado)
export const colors = {
  primary: '#0F5C8C',
  primaryDark: '#0A4366',
  primaryLight: '#E3F0F8',
  accent: '#12A39A',
  background: '#F2F5F9',
  surface: '#FFFFFF',
  text: '#14212B',
  textMuted: '#5B6B79',
  border: '#DCE3EA',
  white: '#FFFFFF',
  success: '#1E7F4F',
  successLight: '#E3F4EA',
  warning: '#A86A0C',
  warningLight: '#FDF1DC',
  danger: '#C0392B',
  dangerLight: '#FBE5E2',
  info: '#2565A8',
  infoLight: '#E4EEF9',
  neutral: '#5B6B79',
  neutralLight: '#ECEFF3',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

export const typography = {
  title: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  subtitle: { fontSize: 17, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  caption: { fontSize: 13, color: colors.textMuted },
};

// Tema de React Navigation alineado con la paleta
export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

// Estilo común de encabezados de navegación
export const headerOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '600' as const },
};
