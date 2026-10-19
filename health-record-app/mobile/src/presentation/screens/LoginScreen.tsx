import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getErrorMessage } from '../../data/api/ApiError';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { LoginScreenProps } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

// Inicio de sesión con correo electrónico o cédula
export function LoginScreen({ navigation }: LoginScreenProps) {
  const { login, sessionMessage, clearSessionMessage } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    clearSessionMessage();
    if (!identifier.trim() || !password) {
      setError('Ingresa tu correo o cédula y tu contraseña.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      // Si es exitoso, el AuthContext cambia a "authenticated" y la navegación muestra la app
      await login({ identifier: identifier.trim(), password });
    } catch (loginError) {
      setError(getErrorMessage(loginError));
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons name="medical" size={40} color={colors.white} />
            </View>
            <Text style={styles.appName}>Mi Expediente</Text>
            <Text style={styles.tagline}>Expediente digital en salud · Demo educativa</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Iniciar sesión</Text>

            {sessionMessage ? (
              <View style={[styles.banner, styles.warningBanner]}>
                <Ionicons name="time-outline" size={18} color={colors.warning} />
                <Text style={[styles.bannerText, { color: colors.warning }]}>{sessionMessage}</Text>
              </View>
            ) : null}

            <FormField
              label="Correo electrónico o cédula"
              placeholder="Correo o número de cédula"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="username"
              returnKeyType="next"
            />
            <FormField
              label="Contraseña"
              placeholder="Tu contraseña"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoCapitalize="none"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />

            {error ? (
              <View style={[styles.banner, styles.errorBanner]}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
                <Text style={[styles.bannerText, { color: colors.danger }]}>{error}</Text>
              </View>
            ) : null}

            <PrimaryButton title="Ingresar" onPress={handleLogin} loading={isSubmitting} />

            <Pressable
              accessibilityRole="link"
              onPress={() => navigation.navigate('Register')}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>
                ¿Aún no tienes cuenta? <Text style={styles.registerHighlight}>Regístrate</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: { fontSize: 28, fontWeight: '800', color: colors.white },
  tagline: { fontSize: 14, color: '#CFE3F1', marginTop: spacing.xs, textAlign: 'center' },
  form: { backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.xl },
  formTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  warningBanner: { backgroundColor: colors.warningLight },
  errorBanner: { backgroundColor: colors.dangerLight },
  bannerText: { flex: 1, fontSize: 14, fontWeight: '500' },
  registerLink: { marginTop: spacing.lg, alignItems: 'center', paddingVertical: spacing.sm },
  registerText: { fontSize: 14, color: colors.textMuted },
  registerHighlight: { color: colors.primary, fontWeight: '700' },
});
