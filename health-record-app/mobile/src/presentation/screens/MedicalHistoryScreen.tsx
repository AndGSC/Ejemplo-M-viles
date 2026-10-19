import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { medicalHistoryRepository } from '../../data/services';
import { Allergy, Diagnosis, VitalSigns } from '../../domain/models/MedicalHistory';
import { Card } from '../components/Card';
import { ErrorState, LoadingState } from '../components/StateViews';
import { StatusBadge } from '../components/StatusBadge';
import { VitalSignsGrid } from '../components/VitalSignsGrid';
import { useApiResource } from '../hooks/useApiResource';
import { colors, radius, spacing } from '../theme';
import { formatDate, formatDateTime, formatLocalDate } from '../utils/formatters';
import { allergySeverityLabels, diagnosisStatusLabels } from '../utils/labels';

const fetchMedicalHistory = () => medicalHistoryRepository.getMedicalHistory();

// Historial clínico: alergias, diagnósticos previos y constantes vitales
export function MedicalHistoryScreen() {
  const { data, error, isLoading, isRefreshing, refresh, retry } = useApiResource(fetchMedicalHistory);

  if (isLoading) return <LoadingState message="Cargando historial..." />;
  if (error || !data) return <ErrorState message={error ?? 'Sin datos'} onRetry={retry} />;

  const [latestVitals, ...previousVitals] = data.vitalSigns;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[colors.primary]} />}
    >
      <Card title="Alergias" icon="warning-outline">
        {data.allergies.length ? (
          data.allergies.map((allergy) => <AllergyItem key={allergy.id} allergy={allergy} />)
        ) : (
          <Text style={styles.muted}>Sin alergias registradas.</Text>
        )}
      </Card>

      <Card title="Diagnósticos" icon="clipboard-outline">
        {data.diagnoses.length ? (
          data.diagnoses.map((diagnosis) => <DiagnosisItem key={diagnosis.id} diagnosis={diagnosis} />)
        ) : (
          <Text style={styles.muted}>Sin diagnósticos registrados.</Text>
        )}
      </Card>

      <Card title="Constantes vitales" icon="pulse-outline">
        {latestVitals ? (
          <>
            <Text style={styles.caption}>Última medición: {formatDateTime(latestVitals.recordedAt)}</Text>
            <VitalSignsGrid vitalSigns={latestVitals} />
            {previousVitals.length ? (
              <View style={styles.previous}>
                <Text style={styles.previousTitle}>Mediciones anteriores</Text>
                {previousVitals.map((vitals) => (
                  <PreviousVitalsRow key={vitals.id} vitals={vitals} />
                ))}
              </View>
            ) : null}
          </>
        ) : (
          <Text style={styles.muted}>Aún no hay mediciones registradas.</Text>
        )}
      </Card>
    </ScrollView>
  );
}

function AllergyItem({ allergy }: { allergy: Allergy }) {
  const severity = allergySeverityLabels[allergy.severity];
  return (
    <View style={[styles.item, allergy.severity === 'SEVERE' && styles.severeItem]}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{allergy.allergen}</Text>
        <StatusBadge label={severity.label} tone={severity.tone} />
      </View>
      <Text style={styles.itemText}>Reacción: {allergy.reaction}</Text>
      <Text style={styles.itemMeta}>Registrada el {formatDate(allergy.recordedAt)}</Text>
    </View>
  );
}

function DiagnosisItem({ diagnosis }: { diagnosis: Diagnosis }) {
  const status = diagnosisStatusLabels[diagnosis.status];
  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <View style={styles.codeChip}>
          <Text style={styles.codeText}>{diagnosis.code}</Text>
        </View>
        <StatusBadge label={status.label} tone={status.tone} />
      </View>
      <Text style={styles.itemTitle}>{diagnosis.name}</Text>
      <Text style={styles.itemMeta}>
        {formatDate(diagnosis.diagnosedAt)} · {diagnosis.doctorName}
      </Text>
      <Text style={styles.itemMeta}>{diagnosis.healthCenter}</Text>
      {diagnosis.notes ? <Text style={styles.itemText}>{diagnosis.notes}</Text> : null}
    </View>
  );
}

function PreviousVitalsRow({ vitals }: { vitals: VitalSigns }) {
  return (
    <View style={styles.previousRow}>
      <Text style={styles.previousDate}>{formatLocalDate(vitals.recordedAt)}</Text>
      <Text style={styles.previousValues}>
        PA {vitals.systolicPressure}/{vitals.diastolicPressure} · FC {vitals.heartRate} · {vitals.weightKg.toFixed(1)} kg
        {vitals.glucoseMgDl !== null ? ` · Gluc. ${vitals.glucoseMgDl}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  muted: { fontSize: 14, color: colors.textMuted },
  caption: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.md },
  item: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
  },
  severeItem: { backgroundColor: colors.dangerLight },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs, gap: spacing.sm },
  itemTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  itemText: { fontSize: 14, color: colors.text, marginTop: spacing.xs, lineHeight: 19 },
  itemMeta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  codeChip: { backgroundColor: colors.primaryLight, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  codeText: { fontSize: 12, fontWeight: '800', color: colors.primary },
  previous: { marginTop: spacing.lg },
  previousTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  previousRow: { paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  previousDate: { fontSize: 13, fontWeight: '600', color: colors.text },
  previousValues: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
