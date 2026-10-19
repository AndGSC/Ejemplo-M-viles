import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Appointment } from '../../domain/models/Appointment';
import { colors, radius, spacing } from '../theme';
import { formatTime, getDateParts } from '../utils/formatters';
import { appointmentStatusLabels } from '../utils/labels';
import { StatusBadge } from './StatusBadge';

// Tarjeta de cita: bloque de calendario a la izquierda y detalle a la derecha
export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const date = getDateParts(appointment.scheduledAt);
  const status = appointmentStatusLabels[appointment.status];

  return (
    <View style={styles.card}>
      <View style={styles.dateBlock}>
        <Text style={styles.month}>{date.month}</Text>
        <Text style={styles.day}>{date.day}</Text>
        <Text style={styles.year}>{date.year}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.specialty}>{appointment.specialty}</Text>
          <StatusBadge label={status.label} tone={status.tone} />
        </View>

        <Detail icon="time-outline" text={`${date.weekday}, ${formatTime(appointment.scheduledAt)}`} />
        <Detail icon="person-outline" text={appointment.doctorName} />
        <Detail
          icon="location-outline"
          text={appointment.location ? `${appointment.healthCenter} · ${appointment.location}` : appointment.healthCenter}
        />
        {appointment.reason ? <Detail icon="document-text-outline" text={appointment.reason} /> : null}

        {appointment.notes ? (
          <View style={styles.notes}>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Detail({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.detail}>
      <Ionicons name={icon} size={15} color={colors.textMuted} />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  dateBlock: {
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
    alignSelf: 'flex-start',
  },
  month: { fontSize: 12, fontWeight: '700', color: colors.primary },
  day: { fontSize: 24, fontWeight: '800', color: colors.primaryDark },
  year: { fontSize: 11, color: colors.textMuted },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.xs, gap: spacing.sm },
  specialty: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  detail: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.xs, gap: spacing.xs + 2 },
  detailText: { flex: 1, fontSize: 14, color: colors.textMuted },
  notes: { marginTop: spacing.sm, backgroundColor: colors.background, borderRadius: radius.sm, padding: spacing.sm },
  notesText: { fontSize: 13, color: colors.text, lineHeight: 18 },
});
