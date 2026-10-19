import { AuthenticatedUser, LoginCredentials, RegisterData, UserToken } from '../../domain/models/Auth';
import { AuthRepository } from '../../domain/repositories';
import { apiClient } from '../api/apiClient';

// Servicio de autenticación: implementa el contrato AuthRepository con llamadas HTTP
export class AuthService implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<UserToken> {
    const { data } = await apiClient.post<UserToken>('/auth/login', credentials);
    return data;
  }

  async register(registerData: RegisterData): Promise<UserToken> {
    const { data } = await apiClient.post<UserToken>('/auth/register', registerData);
    return data;
  }

  // Ruta protegida: el interceptor agrega el token automáticamente
  async getCurrentUser(): Promise<AuthenticatedUser> {
    const { data } = await apiClient.get<AuthenticatedUser>('/auth/me');
    return data;
  }
}
