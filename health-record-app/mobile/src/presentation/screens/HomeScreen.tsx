import { Ionicons } from '@expo/vector-icons';
import { useLayoutEffect } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { patientRepository } from '../../data/services';
import { Card } from '../components/Card';
import { ErrorState, LoadingState } from '../components/StateViews';
import { StatusBadge } from '../components/StatusBadge';
import { VitalSignsGrid } from '../components/VitalSignsGrid';
import { useApiResource } from '../hooks/useApiResource';
import { HomeScreenProps } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { formatDateTime, formatNationalId, pluralize } from '../utils/formatters';
import { allergySeverityLabels } from '../utils/labels';

// Función estable (fuera del componente) para el hook de carga
const fetchHomeSummary = () => patientRepository.getHomeSummary();

// Pantalla de inicio: resumen del expediente
export function HomeScreen({ navigation }: HomeScreenProps) {
  const { data, error, isLoading, isRefreshing, refresh, retry } = useApiResource(fetchHomeSummary);

  // Botón de perfil en el encabezado
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('Profile')}
          accessibilityRole="button"
          accessibilityLabel="Ver mi perfil"
          hitSlop={10}
          style={styles.headerButton}
        >
          <Ionicons name="person-circle-outline" size={28} color={colors.white} />
        </Pressable>
      ),
    });
  }, [navigation]);

  if (isLoading) return <LoadingState message="Cargando tu expediente..." />;
  if (error || !data) return <ErrorState message={error ?? 'Sin datos'} onRetry={retry} />;

  const { patient, nextAppointment, latestVitalSigns } = data;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[colors.primary]} />}
    >
      {/* Saludo y datos básicos */}
      <View style={styles.hero}>
        <Text style={styles.greeting}>Hola, {patient.firstName}</Text>
        <Text style={styles.heroText}>
          Cédula {formatNationalId(patient.nationalId)} · {patient.age} años
        </Text>
        <View style={styles.bloodPill}>
          <Ionicons name="water" size={14} color={colors.danger} />
          <Text style={styles.bloodText}>Tipo de sangre {patient.bloodType}</Text>
        </View>
      </View>

      {/* Alergias: información crítica siempre visible */}
      <Card title="Alergias" icon="warning-outline" style={data.allergies.length ? styles.allergyCard : undefined}>
        {data.allergies.length ? (
          <View style={styles.badgeRow}>
            {data.allergies.map((allergy) => (
              <View key={allergy.allergen} style={styles.allergyItem}>
                <Text style={styles.allergen}>{allergy.allergen}</Text>
                <StatusBadge {...allergySeverityLabels[allergy.severity]} />
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>No tienes alergias registradas.</Text>
        )}
      </Card>

      {/* Próxima cita */}
      <Card title="Próxima cita" icon="calendar-outline">
        {nextAppointment ? (
          <View>
            <Text style={styles.highlight}>{formatDateTime(nextAppointment.scheduledAt)}</Text>
            <Text style={styles.bodyStrong}>{nextAppointment.specialty}</Text>
            <Text style={styles.muted}>{nextAppointment.doctorName}</Text>
            <Text style={styles.muted}>
              {nextAppointment.healthCenter}
              {nextAppointment.location ? ` · ${nextAppointment.location}` : ''}
            </Text>
          </View>
        ) : (
          <Text style={styles.muted}>No tienes citas programadas.</Text>
        )}
      </Card>

      {/* Indicadores rápidos */}
      <View style={styles.statsRow}>
        <StatTile
          icon="medkit-outline"
          value={data.activePrescriptionsCount}
          label="Medicamentos activos"
          caption={data.readyForPickupCount ? pluralize(data.readyForPickupCount, 'listo para retirar', 'listos para retirar') : undefined}
          onPress={() => navigation.navigate('Prescriptions')}
        />
        <StatTile
          icon="calendar-number-outline"
          value={data.upcomingAppointmentsCount}
          label="Citas próximas"
          onPress={() => navigation.navigate('Appointments')}
        />
      </View>

      {/* Constantes vitales más recientes */}
      <Card title="Últimas constantes vitales" icon="pulse-outline">
        {latestVitalSigns ? (
          <>
            <Text style={styles.caption}>Medición del {formatDateTime(latestVitalSigns.recordedAt)}</Text>
            <VitalSignsGrid vitalSigns={latestVitalSigns} />
          </>
        ) : (
          <Text style={styles.muted}>Aún no hay mediciones registradas.</Text>
        )}
      </Card>
    </ScrollView>
  );
}

interface StatTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  caption?: string;
  onPress: () => void;
}

function StatTile({ icon, value, label, caption, onPress }: StatTileProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.statTile, pressed && styles.pressed]}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {caption ? <Text style={styles.statCaption}>{caption}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  headerButton: { marginRight: spacing.lg },
  hero: { backgroundColor: colors.primaryDark, borderRadius: radius.lg, padding: spacing.xl },
  greeting: { fontSize: 24, fontWeight: '800', color: colors.white },
  heroText: { fontSize: 14, color: '#CFE3F1', marginTop: spacing.xs },
  bloodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  bloodText: { fontSize: 13, fontWeight: '700', color: colors.text },
  allergyCard: { borderColor: colors.danger, borderWidth: 1, backgroundColor: '#FFF8F7' },
  badgeRow: { gap: spacing.sm },
  allergyItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  allergen: { fontSize: 15, fontWeight: '600', color: colors.text },
  highlight: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: spacing.xs },
  bodyStrong: { fontSize: 15, fontWeight: '600', color: colors.text },
  muted: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  caption: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.8 },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  statLabel: { fontSize: 13, color: colors.textMuted },
  statCaption: { fontSize: 12, color: colors.info, fontWeight: '600', marginTop: spacing.xs },
});
