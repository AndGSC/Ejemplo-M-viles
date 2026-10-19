import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { BadgeTone } from '../utils/labels';

const TONES: Record<BadgeTone, { background: string; text: string }> = {
  success: { background: colors.successLight, text: colors.success },
  warning: { background: colors.warningLight, text: colors.warning },
  danger: { background: colors.dangerLight, text: colors.danger },
  info: { background: colors.infoLight, text: colors.info },
  neutral: { background: colors.neutralLight, text: colors.neutral },
};

// Etiqueta de estado con color según su significado
export function StatusBadge({ label, tone }: { label: string; tone: BadgeTone }) {
  const palette = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  text: { fontSize: 12, fontWeight: '700' },
});
