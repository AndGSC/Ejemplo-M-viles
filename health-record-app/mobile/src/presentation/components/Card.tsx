import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface CardProps {
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

// Tarjeta base reutilizable con título e ícono opcionales
export function Card({ title, icon, right, style, children }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {title ? (
        <View style={styles.header}>
          {icon ? <Ionicons name={icon} size={18} color={colors.primary} style={styles.icon} /> : null}
          <Text style={styles.title}>{title}</Text>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    // Sombra suave (iOS) y elevación (Android)
    shadowColor: '#0A2540',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  icon: { marginRight: spacing.sm },
  title: { ...typography.subtitle, flex: 1 },
});
