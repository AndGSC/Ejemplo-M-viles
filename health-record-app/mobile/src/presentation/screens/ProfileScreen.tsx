import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { patientRepository } from '../../data/services';
import { EmergencyContact } from '../../domain/models/Patient';
import { Card } from '../components/Card';
import { InfoRow } from '../components/InfoRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { ErrorState, LoadingState } from '../components/StateViews';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useApiResource } from '../hooks/useApiResource';
import { colors, radius, spacing } from '../theme';
import { formatDate, formatNationalId } from '../utils/formatters';
import { sexLabels } from '../utils/labels';

const fetchProfile = () => patientRepository.getProfile();

// Perfil del paciente: datos personales, tipo de sangre y contactos de emergencia
export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { data: profile, error, isLoading, isRefreshing, refresh, retry } = useApiResource(fetchProfile);

  const confirmLogout = () => {
    // Alert con botones no está disponible en web: ahí se cierra la sesión directamente
    if (Platform.OS === 'web') {
      void logout();
      return;
    }
    Alert.alert('Cerrar sesión', '¿Deseas salir de tu expediente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  if (isLoading) return <LoadingState message="Cargando perfil..." />;
  if (error || !profile) return <ErrorState message={error ?? 'Sin datos'} onRetry={retry} />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[colors.primary]} />}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.firstName.charAt(0)}
            {profile.lastName.charAt(0)}
          </Text>
        </View>
        <Text style={styles.name}>{profile.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Card title="Datos personales" icon="id-card-outline">
        <InfoRow label="Cédula" value={formatNationalId(profile.nationalId)} />
        <InfoRow label="Nacimiento" value={`${formatDate(profile.birthDate)} (${profile.age} años)`} />
        <InfoRow label="Sexo" value={sexLabels[profile.sex]} />
        <InfoRow label="Tipo de sangre" value={profile.bloodType} />
        <InfoRow label="Teléfono" value={profile.phone} />
        <InfoRow label="Dirección" value={profile.address} />
        <InfoRow label="Área de salud" value={profile.healthArea} />
      </Card>

      <Card title="Contactos de emergencia" icon="call-outline">
        {profile.emergencyContacts.length ? (
          profile.emergencyContacts.map((contact) => <ContactItem key={contact.id} contact={contact} />)
        ) : (
          <Text style={styles.muted}>No hay contactos de emergencia registrados.</Text>
        )}
      </Card>

      <PrimaryButton title="Cerrar sesión" onPress={confirmLogout} variant="danger" />
    </ScrollView>
  );
}

function ContactItem({ contact }: { contact: EmergencyContact }) {
  const call = () => void Linking.openURL(`tel:${contact.phone.replace(/\D/g, '')}`);

  return (
    <View style={styles.contact}>
      <View style={styles.contactInfo}>
        <View style={styles.contactNameRow}>
          <Text style={styles.contactName}>{contact.fullName}</Text>
          {contact.isPrimary ? <StatusBadge label="Principal" tone="info" /> : null}
        </View>
        <Text style={styles.muted}>
          {contact.relationship} · {contact.phone}
        </Text>
      </View>
      <Pressable
        onPress={call}
        accessibilityRole="button"
        accessibilityLabel={`Llamar a ${contact.fullName}`}
        style={styles.callButton}
      >
        <Ionicons name="call" size={18} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', paddingVertical: spacing.md },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: colors.white },
  name: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: spacing.md, textAlign: 'center' },
  email: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  muted: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  contactInfo: { flex: 1 },
  contactNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  contactName: { fontSize: 15, fontWeight: '600', color: colors.text },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
});
