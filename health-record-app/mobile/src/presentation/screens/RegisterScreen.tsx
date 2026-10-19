import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getErrorMessage } from '../../data/api/ApiError';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { RegisterScreenProps } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { maskIsoDate } from '../utils/formatters';

interface RegisterForm {
  nationalId: string;
  birthDate: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof RegisterForm, string>>;

const EMPTY_FORM: RegisterForm = { nationalId: '', birthDate: '', email: '', password: '', confirmPassword: '' };

// Validación en el cliente (la API vuelve a validar todo: nunca se confía solo en el cliente)
function validate(form: RegisterForm): FormErrors {
  const errors: FormErrors = {};
  const nationalIdDigits = form.nationalId.replace(/\D/g, '');

  if (!/^\d{9,12}$/.test(nationalIdDigits)) errors.nationalId = 'Ingresa una cédula de 9 a 12 dígitos';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.birthDate)) errors.birthDate = 'Usa el formato AAAA-MM-DD';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errors.email = 'Ingresa un correo válido';

  if (form.password.length < 8) errors.password = 'Mínimo 8 caracteres';
  else if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/\d/.test(form.password)) {
    errors.password = 'Debe incluir mayúscula, minúscula y número';
  }
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Las contraseñas no coinciden';

  return errors;
}

// Registro: el paciente crea su cuenta sobre un expediente que ya existe en el sistema
export function RegisterScreen(_props: RegisterScreenProps) {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof RegisterForm) => (value: string) => {
    setForm((current) => ({ ...current, [field]: field === 'birthDate' ? maskIsoDate(value) : value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleRegister = async () => {
    const validationErrors = validate(form);
    setErrors(validationErrors);
    setApiError(null);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      // Al registrarse, la API devuelve un JWT y el usuario entra directamente a la app
      await register({
        nationalId: form.nationalId,
        birthDate: form.birthDate,
        email: form.email.trim(),
        password: form.password,
      });
    } catch (registerError) {
      setApiError(getErrorMessage(registerError));
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.info}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            Tu expediente ya existe en el sistema de salud. Para crear tu cuenta, confirma tu cédula y tu fecha de
            nacimiento.
          </Text>
        </View>

        <FormField
          label="Cédula"
          placeholder="2-0456-0789"
          value={form.nationalId}
          onChangeText={updateField('nationalId')}
          keyboardType="number-pad"
          error={errors.nationalId}
        />
        <FormField
          label="Fecha de nacimiento"
          placeholder="AAAA-MM-DD"
          value={form.birthDate}
          onChangeText={updateField('birthDate')}
          keyboardType="number-pad"
          maxLength={10}
          error={errors.birthDate}
        />
        <FormField
          label="Correo electrónico"
          placeholder="correo@ejemplo.com"
          value={form.email}
          onChangeText={updateField('email')}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          error={errors.email}
        />
        <FormField
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChangeText={updateField('password')}
          isPassword
          autoCapitalize="none"
          textContentType="newPassword"
          error={errors.password}
        />
        <FormField
          label="Confirmar contraseña"
          placeholder="Repite la contraseña"
          value={form.confirmPassword}
          onChangeText={updateField('confirmPassword')}
          isPassword
          autoCapitalize="none"
          error={errors.confirmPassword}
        />

        {apiError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{apiError}</Text>
          </View>
        ) : null}

        <PrimaryButton title="Crear cuenta" onPress={handleRegister} loading={isSubmitting} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  info: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.infoLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  infoText: { flex: 1, fontSize: 14, color: colors.info, lineHeight: 20 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: { flex: 1, color: colors.danger, fontSize: 14, fontWeight: '500' },
});
