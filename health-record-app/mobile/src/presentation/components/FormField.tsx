import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  isPassword?: boolean; // Agrega el botón de mostrar/ocultar contraseña
}

// Campo de formulario con etiqueta, mensaje de error y opción de contraseña oculta
export function FormField({ label, error, isPassword = false, style, ...inputProps }: FormFieldProps) {
  const [hidden, setHidden] = useState(isPassword);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          autoCorrect={false}
          style={[styles.input, style]}
          accessibilityLabel={label}
          {...inputProps}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setHidden((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            hitSlop={10}
            style={styles.toggle}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs + 2 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  inputError: { borderColor: colors.danger },
  input: { flex: 1, minHeight: 48, paddingHorizontal: spacing.md, fontSize: 16, color: colors.text },
  toggle: { paddingHorizontal: spacing.md },
  error: { color: colors.danger, fontSize: 13, marginTop: spacing.xs },
});
