import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { appointmentRepository } from '../../data/services';
import { AppointmentCard } from '../components/AppointmentCard';
import { SegmentedControl } from '../components/SegmentedControl';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useApiResource } from '../hooks/useApiResource';
import { colors, spacing } from '../theme';

type AppointmentTab = 'upcoming' | 'history';

const fetchAppointments = () => appointmentRepository.getAppointments();

// Citas médicas: próximas e historial de atenciones
export function AppointmentsScreen() {
  const [tab, setTab] = useState<AppointmentTab>('upcoming');
  const { data, error, isLoading, isRefreshing, refresh, retry } = useApiResource(fetchAppointments);

  if (isLoading) return <LoadingState message="Cargando citas..." />;
  if (error || !data) return <ErrorState message={error ?? 'Sin datos'} onRetry={retry} />;

  const appointments = tab === 'upcoming' ? data.upcoming : data.history;

  return (
    <View style={styles.screen}>
      <View style={styles.selector}>
        <SegmentedControl
          selected={tab}
          onChange={setTab}
          options={[
            { value: 'upcoming', label: `Próximas (${data.upcoming.length})` },
            { value: 'history', label: `Historial (${data.history.length})` },
          ]}
        />
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(appointment) => appointment.id}
        renderItem={({ item }) => <AppointmentCard appointment={item} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[colors.primary]} />}
        ListEmptyComponent={
          tab === 'upcoming' ? (
            <EmptyState icon="calendar-clear-outline" title="Sin citas programadas" message="Cuando tengas una cita nueva aparecerá aquí." />
          ) : (
            <EmptyState icon="time-outline" title="Sin historial de atenciones" />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  selector: { padding: spacing.lg, paddingBottom: spacing.sm },
  list: { padding: spacing.lg, paddingTop: spacing.sm },
});
