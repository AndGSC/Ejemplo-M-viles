import { create } from 'axios';
import { API_TIMEOUT_MS, API_URL } from '../../config/env';
import { toApiError } from './ApiError';

// Token vigente en memoria. El AuthContext lo carga desde el almacenamiento seguro
// al iniciar la app y lo actualiza al iniciar o cerrar sesión.
let authToken: string | null = null;

// Función que se ejecuta cuando la API rechaza un token (401): la registra el AuthContext
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

// Cliente HTTP único de la app
export const apiClient = create({
  baseURL: API_URL,
  timeout: API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de PETICIÓN: adjunta automáticamente "Authorization: Bearer <token>"
apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.set('Authorization', `Bearer ${authToken}`);
  }
  return config;
});

// Interceptor de RESPUESTA: normaliza los errores y detecta sesiones expiradas
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    // Un 401 en una petición que SÍ llevaba token significa que expiró o es inválido.
    // (Un 401 en el login, sin token, es solo "credenciales inválidas").
    if (apiError.status === 401 && authToken && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(apiError);
  },
);
