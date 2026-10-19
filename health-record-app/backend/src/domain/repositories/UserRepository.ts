import { NewUser, User, UserWithCredentials } from '../entities/User';

// Contrato (puerto) de acceso a usuarios. La implementación concreta vive en infrastructure/.
export interface UserRepository {
  findByEmail(email: string): Promise<UserWithCredentials | null>;
  findByNationalId(nationalId: string): Promise<UserWithCredentials | null>;
  findById(id: string): Promise<User | null>;
  findByPatientId(patientId: string): Promise<User | null>;
  create(user: NewUser): Promise<User>;
  updateLastLogin(userId: string, date: Date): Promise<void>;
}
