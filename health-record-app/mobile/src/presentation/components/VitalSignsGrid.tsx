import { StyleSheet, Text, View } from 'react-native';
import { VitalSigns } from '../../domain/models/MedicalHistory';
import { colors, radius, spacing } from '../theme';

// Cuadrícula con las constantes vitales de una medición
export function VitalSignsGrid({ vitalSigns }: { vitalSigns: VitalSigns }) {
  const items = [
    { label: 'Presión arterial', value: `${vitalSigns.systolicPressure}/${vitalSigns.diastolicPressure}`, unit: 'mmHg' },
    { label: 'Frecuencia cardíaca', value: String(vitalSigns.heartRate), unit: 'lpm' },
    { label: 'Temperatura', value: vitalSigns.temperatureC.toFixed(1), unit: '°C' },
    { label: 'Saturación O₂', value: String(vitalSigns.oxygenSaturation), unit: '%' },
    { label: 'Peso', value: vitalSigns.weightKg.toFixed(1), unit: 'kg' },
    { label: 'IMC', value: vitalSigns.bmi.toFixed(1), unit: 'kg/m²' },
  ];
  if (vitalSigns.glucoseMgDl !== null) {
    items.push({ label: 'Glucosa', value: String(vitalSigns.glucoseMgDl), unit: 'mg/dL' });
  }

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>
            {item.value} <Text style={styles.unit}>{item.unit}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  item: { width: '50%', padding: spacing.xs },
  label: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  value: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  unit: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
});
