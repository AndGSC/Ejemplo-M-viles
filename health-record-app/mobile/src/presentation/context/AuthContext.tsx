import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken, setUnauthorizedHandler } from '../../data/api/apiClient';
import { authRepository } from '../../data/services';
import { secureStorage } from '../../data/storage/secureStorage';
import { AuthenticatedUser, LoginCredentials, RegisterData, UserToken } from '../../domain/models/Auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthenticatedUser | null;
  sessionMessage: string | null; // Ej. "Tu sesión expiró"
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearSessionMessage: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Proveedor del estado global de autenticación (login, logout y token persistente)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  // Borra la sesión en memoria y en el almacenamiento seguro
  const clearSession = useCallback(async (message: string | null) => {
    setAuthToken(null);
    await secureStorage.clearSession();
    setUser(null);
    setSessionMessage(message);
    setStatus('unauthenticated');
  }, []);

  // Guarda la sesión recibida de la API y entra a la app
  const startSession = useCallback(async ({ token, user: authenticatedUser }: UserToken) => {
    await secureStorage.saveSession({ token, user: authenticatedUser });
    setAuthToken(token);
    setUser(authenticatedUser);
    setSessionMessage(null);
    setStatus('authenticated');
  }, []);

  // Si la API rechaza el token en cualquier pantalla (expiró), se cierra la sesión
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession('Tu sesión expiró. Inicia sesión de nuevo.');
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Al abrir la app: restaurar la sesión guardada y validarla con el servidor
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const stored = await secureStorage.getSession();
      if (cancelled) return;
      if (!stored) {
        setStatus('unauthenticated');
        return;
      }

      // Entrada inmediata con los datos guardados (arranque rápido)
      setAuthToken(stored.token);
      setUser(stored.user);
      setStatus('authenticated');

      try {
        // Validación en segundo plano: GET /auth/me con el token guardado
        const currentUser = await authRepository.getCurrentUser();
        if (cancelled) return;
        setUser(currentUser);
        await secureStorage.saveSession({ token: stored.token, user: currentUser });
      } catch {
        // - 401 (token expirado o inválido): el interceptor ya cerró la sesión.
        // - Sin conexión: se conserva la sesión y cada pantalla mostrará el error con "Reintentar".
      }
    };

    restoreSession().catch(() => {
      if (!cancelled) setStatus('unauthenticated');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => startSession(await authRepository.login(credentials)),
    [startSession],
  );

  const register = useCallback(
    async (data: RegisterData) => startSession(await authRepository.register(data)),
    [startSession],
  );

  const logout = useCallback(() => clearSession(null), [clearSession]);
  const clearSessionMessage = useCallback(() => setSessionMessage(null), []);

  const value = useMemo(
    () => ({ status, user, sessionMessage, login, register, logout, clearSessionMessage }),
    [status, user, sessionMessage, login, register, logout, clearSessionMessage],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
