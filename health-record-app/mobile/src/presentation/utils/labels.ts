import { AppointmentStatus } from '../../domain/models/Appointment';
import { AllergySeverity, DiagnosisStatus } from '../../domain/models/MedicalHistory';
import { Sex } from '../../domain/models/Patient';
import { DeliveryStatus } from '../../domain/models/Prescription';

// Tono visual de las etiquetas de estado
export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusLabel {
  label: string;
  tone: BadgeTone;
}

// Traducción de los códigos de la API a textos en español para la interfaz

export const appointmentStatusLabels: Record<AppointmentStatus, StatusLabel> = {
  SCHEDULED: { label: 'Programada', tone: 'info' },
  COMPLETED: { label: 'Atendida', tone: 'success' },
  CANCELLED: { label: 'Cancelada', tone: 'neutral' },
  MISSED: { label: 'Ausente', tone: 'danger' },
};

export const deliveryStatusLabels: Record<DeliveryStatus, StatusLabel> = {
  PENDING: { label: 'Pendiente de despacho', tone: 'warning' },
  READY_FOR_PICKUP: { label: 'Lista para retirar', tone: 'info' },
  DELIVERED: { label: 'Entregado', tone: 'success' },
};

export const diagnosisStatusLabels: Record<DiagnosisStatus, StatusLabel> = {
  ACTIVE: { label: 'Activo', tone: 'warning' },
  CONTROLLED: { label: 'Controlado', tone: 'info' },
  RESOLVED: { label: 'Resuelto', tone: 'success' },
};

export const allergySeverityLabels: Record<AllergySeverity, StatusLabel> = {
  MILD: { label: 'Leve', tone: 'info' },
  MODERATE: { label: 'Moderada', tone: 'warning' },
  SEVERE: { label: 'Severa', tone: 'danger' },
};

export const sexLabels: Record<Sex, string> = {
  FEMALE: 'Femenino',
  MALE: 'Masculino',
};
