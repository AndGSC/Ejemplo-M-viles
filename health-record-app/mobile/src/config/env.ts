import { Platform } from 'react-native';

// URL base de la API. Se define en mobile/.env con EXPO_PUBLIC_API_URL
// (Expo reemplaza las variables EXPO_PUBLIC_* al compilar).
// Valores por defecto si no se define:
//  - Emulador de Android: 10.0.2.2 es la dirección de la computadora anfitriona.
//  - Simulador de iOS / navegador web: localhost.
// En un teléfono físico con Expo Go se debe usar la IP de la computadora en la red local.
const DEFAULT_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');

export const API_TIMEOUT_MS = 10000;
