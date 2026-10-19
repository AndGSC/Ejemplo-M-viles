import { Pool } from 'pg';
import {
  Allergy,
  AllergySeverity,
  Diagnosis,
  DiagnosisStatus,
  VitalSigns,
} from '../../domain/entities/MedicalHistory';
import { MedicalHistoryRepository } from '../../domain/repositories/MedicalHistoryRepository';

interface DiagnosisRow {
  id: string;
  diagnosis_code: string;
  diagnosis_name: string;
  diagnosed_at: string;
  doctor_name: string;
  health_center: string;
  status: DiagnosisStatus;
  notes: string | null;
}

interface AllergyRow {
  id: string;
  allergen: string;
  reaction: string;
  severity: AllergySeverity;
  recorded_at: string;
}

interface VitalSignsRow {
  id: string;
  recorded_at: Date;
  systolic_pressure: number;
  diastolic_pressure: number;
  heart_rate: number;
  temperature_c: number;
  weight_kg: number;
  height_cm: number;
  oxygen_saturation: number;
  glucose_mg_dl: number | null;
}

export class PostgresMedicalHistoryRepository implements MedicalHistoryRepository {
  constructor(private readonly pool: Pool) {}

  async findDiagnoses(patientId: string): Promise<Diagnosis[]> {
    const { rows } = await this.pool.query<DiagnosisRow>(
      `SELECT id, diagnosis_code, diagnosis_name, diagnosed_at, doctor_name, health_center, status, notes
         FROM medical_records
        WHERE patient_id = $1
        ORDER BY diagnosed_at DESC`,
      [patientId],
    );
    return rows.map((row) => ({
      id: row.id,
      code: row.diagnosis_code,
      name: row.diagnosis_name,
      diagnosedAt: row.diagnosed_at,
      doctorName: row.doctor_name,
      healthCenter: row.health_center,
      status: row.status,
      notes: row.notes,
    }));
  }

  async findAllergies(patientId: string): Promise<Allergy[]> {
    // Primero las alergias más graves
    const { rows } = await this.pool.query<AllergyRow>(
      `SELECT id, allergen, reaction, severity, recorded_at
         FROM allergies
        WHERE patient_id = $1
        ORDER BY CASE severity WHEN 'SEVERE' THEN 1 WHEN 'MODERATE' THEN 2 ELSE 3 END, allergen`,
      [patientId],
    );
    return rows.map((row) => ({
      id: row.id,
      allergen: row.allergen,
      reaction: row.reaction,
      severity: row.severity,
      recordedAt: row.recorded_at,
    }));
  }

  async findVitalSigns(patientId: string, limit: number): Promise<VitalSigns[]> {
    const { rows } = await this.pool.query<VitalSignsRow>(
      `SELECT id, recorded_at, systolic_pressure, diastolic_pressure, heart_rate, temperature_c,
              weight_kg, height_cm, oxygen_saturation, glucose_mg_dl
         FROM vital_signs
        WHERE patient_id = $1
        ORDER BY recorded_at DESC
        LIMIT $2`,
      [patientId, limit],
    );
    return rows.map((row) => ({
      id: row.id,
      recordedAt: row.recorded_at,
      systolicPressure: row.systolic_pressure,
      diastolicPressure: row.diastolic_pressure,
      heartRate: row.heart_rate,
      temperatureC: row.temperature_c,
      weightKg: row.weight_kg,
      heightCm: row.height_cm,
      oxygenSaturation: row.oxygen_saturation,
      glucoseMgDl: row.glucose_mg_dl,
    }));
  }
}
