import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

interface InfoRowProps {
  label: string;
  value: string | null | undefined;
  icon?: keyof typeof Ionicons.glyphMap;
}

// Fila "etiqueta: valor" para mostrar datos del expediente
export function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <View style={styles.row}>
      {icon ? <Ionicons name={icon} size={16} color={colors.textMuted} style={styles.icon} /> : null}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'No registrado'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  icon: { marginRight: spacing.sm, marginTop: 1 },
  label: { width: 120, fontSize: 14, color: colors.textMuted },
  value: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '500' },
});
