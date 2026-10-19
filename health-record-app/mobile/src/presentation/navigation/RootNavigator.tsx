import { LoadingState } from '../components/StateViews';
import { useAuth } from '../context/AuthContext';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';

/**
 * Navegación condicional según el estado de autenticación:
 *  - loading         → se está leyendo el token del almacenamiento seguro
 *  - authenticated   → AppStack (pantallas protegidas)
 *  - unauthenticated → AuthStack (login y registro)
 * Al cambiar el estado en el AuthContext, React Navigation cambia de flujo automáticamente.
 */
export function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') return <LoadingState message="Verificando sesión..." />;
  return status === 'authenticated' ? <AppStack /> : <AuthStack />;
}
