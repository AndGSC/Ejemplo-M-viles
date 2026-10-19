import { Pool } from 'pg';
import { BloodType, EmergencyContact, Patient, Sex } from '../../domain/entities/Patient';
import { PatientRepository } from '../../domain/repositories/PatientRepository';

interface PatientRow {
  id: string;
  national_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  sex: Sex;
  blood_type: BloodType;
  phone: string | null;
  address: string | null;
  health_area: string | null;
}

interface EmergencyContactRow {
  id: string;
  full_name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
}

const PATIENT_COLUMNS =
  'id, national_id, first_name, last_name, birth_date, sex, blood_type, phone, address, health_area';

function toPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    nationalId: row.national_id,
    firstName: row.first_name,
    lastName: row.last_name,
    birthDate: row.birth_date,
    sex: row.sex,
    bloodType: row.blood_type,
    phone: row.phone,
    address: row.address,
    healthArea: row.health_area,
  };
}

export class PostgresPatientRepository implements PatientRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Patient | null> {
    const { rows } = await this.pool.query<PatientRow>(`SELECT ${PATIENT_COLUMNS} FROM patients WHERE id = $1`, [id]);
    return rows[0] ? toPatient(rows[0]) : null;
  }

  async findByNationalId(nationalId: string): Promise<Patient | null> {
    const { rows } = await this.pool.query<PatientRow>(
      `SELECT ${PATIENT_COLUMNS} FROM patients WHERE national_id = $1`,
      [nationalId],
    );
    return rows[0] ? toPatient(rows[0]) : null;
  }

  async findEmergencyContacts(patientId: string): Promise<EmergencyContact[]> {
    const { rows } = await this.pool.query<EmergencyContactRow>(
      `SELECT id, full_name, relationship, phone, is_primary
         FROM emergency_contacts
        WHERE patient_id = $1
        ORDER BY is_primary DESC, full_name`,
      [patientId],
    );
    return rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      relationship: row.relationship,
      phone: row.phone,
      isPrimary: row.is_primary,
    }));
  }
}
