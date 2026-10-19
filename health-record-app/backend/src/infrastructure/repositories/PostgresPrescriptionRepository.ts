import { Pool } from 'pg';
import { DeliveryStatus, Prescription, PrescriptionStatus } from '../../domain/entities/Prescription';
import { PrescriptionRepository } from '../../domain/repositories/PrescriptionRepository';

interface PrescriptionRow {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  route: string;
  instructions: string | null;
  quantity: number;
  start_date: string;
  end_date: string | null;
  prescribed_by: string;
  pharmacy: string;
  status: PrescriptionStatus;
  delivery_status: DeliveryStatus;
  delivered_at: Date | null;
}

export class PostgresPrescriptionRepository implements PrescriptionRepository {
  constructor(private readonly pool: Pool) {}

  async findByPatientId(patientId: string): Promise<Prescription[]> {
    const { rows } = await this.pool.query<PrescriptionRow>(
      `SELECT id, medication_name, dosage, frequency, route, instructions, quantity,
              start_date, end_date, prescribed_by, pharmacy, status, delivery_status, delivered_at
         FROM prescriptions
        WHERE patient_id = $1
        ORDER BY start_date DESC, medication_name`,
      [patientId],
    );
    return rows.map((row) => ({
      id: row.id,
      medicationName: row.medication_name,
      dosage: row.dosage,
      frequency: row.frequency,
      route: row.route,
      instructions: row.instructions,
      quantity: row.quantity,
      startDate: row.start_date,
      endDate: row.end_date,
      prescribedBy: row.prescribed_by,
      pharmacy: row.pharmacy,
      status: row.status,
      deliveryStatus: row.delivery_status,
      deliveredAt: row.delivered_at,
    }));
  }
}
