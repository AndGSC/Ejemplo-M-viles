import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppointmentsScreen } from '../screens/AppointmentsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MedicalHistoryScreen } from '../screens/MedicalHistoryScreen';
import { PrescriptionsScreen } from '../screens/PrescriptionsScreen';
import { colors, headerOptions } from '../theme';
import { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

// Íconos de cada pestaña (relleno cuando está activa)
const TAB_ICONS: Record<keyof AppTabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Home: ['home', 'home-outline'],
  Appointments: ['calendar', 'calendar-outline'],
  Prescriptions: ['medkit', 'medkit-outline'],
  MedicalHistory: ['document-text', 'document-text-outline'],
};

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerOptions,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio', headerTitle: 'Mi Expediente' }} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{ title: 'Citas', headerTitle: 'Citas médicas' }} />
      <Tab.Screen name="Prescriptions" component={PrescriptionsScreen} options={{ title: 'Recetas', headerTitle: 'Medicamentos activos' }} />
      <Tab.Screen name="MedicalHistory" component={MedicalHistoryScreen} options={{ title: 'Historial', headerTitle: 'Historial clínico' }} />
    </Tab.Navigator>
  );
}
