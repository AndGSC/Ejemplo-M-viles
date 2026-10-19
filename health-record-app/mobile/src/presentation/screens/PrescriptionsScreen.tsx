import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { prescriptionRepository } from '../../data/services';
import { PrescriptionCard } from '../components/PrescriptionCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useApiResource } from '../hooks/useApiResource';
import { colors, spacing } from '../theme';
import { pluralize } from '../utils/formatters';

const fetchActivePrescriptions = () => prescriptionRepository.getActivePrescriptions();

// Recetas: medicamentos activos, indicaciones, dosis y estado de entrega
export function PrescriptionsScreen() {
  const { data, error, isLoading, isRefreshing, refresh, retry } = useApiResource(fetchActivePrescriptions);

  if (isLoading) return <LoadingState message="Cargando medicamentos..." />;
  if (error || !data) return <ErrorState message={error ?? 'Sin datos'} onRetry={retry} />;

  return (
    <FlatList
      style={styles.screen}
      data={data}
      keyExtractor={(prescription) => prescription.id}
      renderItem={({ item }) => <PrescriptionCard prescription={item} />}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[colors.primary]} />}
      ListHeaderComponent={
        data.length ? (
          <Text style={styles.summary}>{pluralize(data.length, 'medicamento activo', 'medicamentos activos')}</Text>
        ) : null
      }
      ListEmptyComponent={
        <EmptyState icon="medkit-outline" title="Sin medicamentos activos" message="No tienes tratamientos vigentes en este momento." />
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg },
  summary: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.md },
});
