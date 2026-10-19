import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Tipos de las rutas de cada navegador (TypeScript valida los nombres y parámetros)

// Flujo público: usuario sin sesión
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Pestañas inferiores de la app protegida
export type AppTabParamList = {
  Home: undefined;
  Appointments: undefined;
  Prescriptions: undefined;
  MedicalHistory: undefined;
};

// Flujo protegido: pestañas + pantallas apiladas encima
export type AppStackParamList = {
  Main: NavigatorScreenParams<AppTabParamList>;
  Profile: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

// La pantalla de inicio puede navegar a otras pestañas y también al perfil (stack padre)
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Home'>,
  NativeStackScreenProps<AppStackParamList>
>;
