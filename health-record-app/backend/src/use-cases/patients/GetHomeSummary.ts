import { Appointment, isUpcoming } from '../../domain/entities/Appointment';
import { AllergySeverity, VitalSignsWithBmi, withBmi } from '../../domain/entities/MedicalHistory';
import { BloodType, calculateAge, getFullName } from '../../domain/entities/Patient';
import { isPrescriptionActive } from '../../domain/entities/Prescription';
import { NotFoundError } from '../../domain/errors/DomainErrors';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { MedicalHistoryRepository } from '../../domain/repositories/MedicalHistoryRepository';
import { PatientRepository } from '../../domain/repositories/PatientRepository';
import { PrescriptionRepository } from '../../domain/repositories/PrescriptionRepository';
import { toIsoDate } from '../../domain/validation/validators';

export interface HomeSummary {
  patient: {
    firstName: string;
    fullName: string;
    nationalId: string;
    age: number;
    bloodType: BloodType;
  };
  nextAppointment: Appointment | null;
  upcomingAppointmentsCount: number;
  activePrescriptionsCount: number;
  readyForPickupCount: number;
  allergies: { allergen: string; severity: AllergySeverity }[];
  latestVitalSigns: VitalSignsWithBmi | null;
}

// Caso de uso: resumen del expediente para la pantalla de inicio
export class GetHomeSummary {
  constructor(
    private readonly patients: PatientRepository,
    private readonly appointments: AppointmentRepository,
    private readonly prescriptions: PrescriptionRepository,
    private readonly medicalHistory: MedicalHistoryRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(patientId: string): Promise<HomeSummary> {
    // Consultas independientes en paralelo
    const [patient, appointments, prescriptions, allergies, vitalSigns] = await Promise.all([
      this.patients.findById(patientId),
      this.appointments.findByPatientId(patientId),
      this.prescriptions.findByPatientId(patientId),
      this.medicalHistory.findAllergies(patientId),
      this.medicalHistory.findVitalSigns(patientId, 1),
    ]);
    if (!patient) throw new NotFoundError('No se encontró el expediente del paciente');

    const now = this.now();
    const upcoming = appointments.filter((appointment) => isUpcoming(appointment, now));
    const active = prescriptions.filter((prescription) => isPrescriptionActive(prescription, toIsoDate(now)));

    return {
      patient: {
        firstName: patient.firstName,
        fullName: getFullName(patient),
        nationalId: patient.nationalId,
        age: calculateAge(patient.birthDate, now),
        bloodType: patient.bloodType,
      },
      nextAppointment: upcoming[0] ?? null,
      upcomingAppointmentsCount: upcoming.length,
      activePrescriptionsCount: active.length,
      readyForPickupCount: active.filter((prescription) => prescription.deliveryStatus === 'READY_FOR_PICKUP').length,
      allergies: allergies.map(({ allergen, severity }) => ({ allergen, severity })),
      latestVitalSigns: vitalSigns[0] ? withBmi(vitalSigns[0]) : null,
    };
  }
}
