import { DatabaseError, Pool } from 'pg';
import { NewUser, User, UserRole, UserWithCredentials } from '../../domain/entities/User';
import { ConflictError } from '../../domain/errors/DomainErrors';
import { UserRepository } from '../../domain/repositories/UserRepository';

// Fila tal como la devuelve PostgreSQL (snake_case)
interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  patient_id: string | null;
  last_login_at: Date | null;
  created_at: Date;
}

const USER_COLUMNS = 'u.id, u.email, u.password_hash, u.role, u.patient_id, u.last_login_at, u.created_at';
const UNIQUE_VIOLATION = '23505';

// Mapper fila → entidad de dominio (camelCase)
function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    patientId: row.patient_id,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
  };
}

function toUserWithCredentials(row: UserRow): UserWithCredentials {
  return { ...toUser(row), passwordHash: row.password_hash };
}

// Repositorio concreto: todas las consultas usan parámetros ($1) para evitar inyección SQL
export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<UserWithCredentials | null> {
    const { rows } = await this.pool.query<UserRow>(`SELECT ${USER_COLUMNS} FROM users u WHERE u.email = $1`, [email]);
    return rows[0] ? toUserWithCredentials(rows[0]) : null;
  }

  async findByNationalId(nationalId: string): Promise<UserWithCredentials | null> {
    const { rows } = await this.pool.query<UserRow>(
      `SELECT ${USER_COLUMNS}
         FROM users u
         JOIN patients p ON p.id = u.patient_id
        WHERE p.national_id = $1`,
      [nationalId],
    );
    return rows[0] ? toUserWithCredentials(rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const { rows } = await this.pool.query<UserRow>(`SELECT ${USER_COLUMNS} FROM users u WHERE u.id = $1`, [id]);
    return rows[0] ? toUser(rows[0]) : null;
  }

  async findByPatientId(patientId: string): Promise<User | null> {
    const { rows } = await this.pool.query<UserRow>(`SELECT ${USER_COLUMNS} FROM users u WHERE u.patient_id = $1`, [
      patientId,
    ]);
    return rows[0] ? toUser(rows[0]) : null;
  }

  async create(user: NewUser): Promise<User> {
    try {
      const { rows } = await this.pool.query<UserRow>(
        `INSERT INTO users AS u (email, password_hash, role, patient_id)
         VALUES ($1, $2, $3, $4)
         RETURNING ${USER_COLUMNS}`,
        [user.email, user.passwordHash, user.role, user.patientId],
      );
      return toUser(rows[0]);
    } catch (error) {
      // Dos registros simultáneos con el mismo correo o paciente: la restricción UNIQUE lo impide
      if (error instanceof DatabaseError && error.code === UNIQUE_VIOLATION) {
        throw new ConflictError('Ya existe una cuenta con ese correo o para ese expediente');
      }
      throw error;
    }
  }

  async updateLastLogin(userId: string, date: Date): Promise<void> {
    await this.pool.query('UPDATE users SET last_login_at = $2 WHERE id = $1', [userId, date]);
  }
}
