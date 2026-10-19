import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthenticatedUser } from '../../domain/models/Auth';

// Almacenamiento seguro de la sesión en el dispositivo:
//  - Android: cifrado con Android Keystore.
//  - iOS: Keychain.
// SecureStore no existe en web; ahí se usa localStorage SOLO para pruebas en el navegador.

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const isWeb = Platform.OS === 'web';

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return globalThis.localStorage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export interface StoredSession {
  token: string;
  user: AuthenticatedUser;
}

export const secureStorage = {
  async saveSession(session: StoredSession): Promise<void> {
    await setItem(TOKEN_KEY, session.token);
    await setItem(USER_KEY, JSON.stringify(session.user));
  },

  async getSession(): Promise<StoredSession | null> {
    const [token, rawUser] = await Promise.all([getItem(TOKEN_KEY), getItem(USER_KEY)]);
    if (!token || !rawUser) return null;
    try {
      return { token, user: JSON.parse(rawUser) as AuthenticatedUser };
    } catch {
      return null; // Datos corruptos: se ignora la sesión guardada
    }
  },

  async clearSession(): Promise<void> {
    await Promise.all([deleteItem(TOKEN_KEY), deleteItem(USER_KEY)]);
  },
};
