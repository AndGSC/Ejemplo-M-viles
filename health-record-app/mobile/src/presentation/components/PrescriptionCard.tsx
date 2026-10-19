import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Prescription } from '../../domain/models/Prescription';
import { colors, radius, spacing } from '../theme';
import { formatDate } from '../utils/formatters';
import { deliveryStatusLabels } from '../utils/labels';
import { StatusBadge } from './StatusBadge';

// Tarjeta de medicamento: dosis, frecuencia, indicaciones y estado de entrega
export function PrescriptionCard({ prescription }: { prescription: Prescription }) {
  const delivery = deliveryStatusLabels[prescription.deliveryStatus];
  const period = prescription.endDate
    ? `${formatDate(prescription.startDate)} – ${formatDate(prescription.endDate)}`
    : `Desde ${formatDate(prescription.startDate)} · Tratamiento continuo`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="medkit-outline" size={20} color={colors.accent} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{prescription.medicationName}</Text>
          <Text style={styles.dosage}>
            {prescription.dosage} · {prescription.route}
          </Text>
        </View>
      </View>

      <View style={styles.frequency}>
        <Ionicons name="alarm-outline" size={16} color={colors.primary} />
        <Text style={styles.frequencyText}>{prescription.frequency}</Text>
      </View>

      {prescription.instructions ? <Text style={styles.instructions}>{prescription.instructions}</Text> : null}

      <View style={styles.meta}>
        <Text style={styles.metaText}>Cantidad: {prescription.quantity}</Text>
        <Text style={styles.metaText}>{period}</Text>
        <Text style={styles.metaText}>Recetado por {prescription.prescribedBy}</Text>
      </View>

      <View style={styles.delivery}>
        <StatusBadge label={delivery.label} tone={delivery.tone} />
        <Text style={styles.pharmacy}>{prescription.pharmacy}</Text>
      </View>
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
    marginBottom: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2F5F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  dosage: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  frequency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  frequencyText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.primaryDark },
  instructions: { fontSize: 14, color: colors.text, marginTop: spacing.md, lineHeight: 20 },
  meta: { marginTop: spacing.md, gap: 2 },
  metaText: { fontSize: 13, color: colors.textMuted },
  delivery: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.xs + 2,
  },
  pharmacy: { fontSize: 13, color: colors.textMuted },
});
