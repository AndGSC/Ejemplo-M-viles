import { Prescription, isPrescriptionActive } from '../../domain/entities/Prescription';
import { PrescriptionRepository } from '../../domain/repositories/PrescriptionRepository';
import { toIsoDate } from '../../domain/validation/validators';

// Caso de uso: medicamentos activos con indicaciones, dosis y estado de entrega
export class GetActivePrescriptions {
  constructor(
    private readonly prescriptions: PrescriptionRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(patientId: string): Promise<Prescription[]> {
    const today = toIsoDate(this.now());
    const all = await this.prescriptions.findByPatientId(patientId);
    return all.filter((prescription) => isPrescriptionActive(prescription, today));
  }
}
