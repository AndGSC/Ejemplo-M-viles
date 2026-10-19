// Entidad de dominio: receta / medicamento

export type PrescriptionStatus = 'ACTIVE' | 'COMPLETED' | 'SUSPENDED';
export type DeliveryStatus = 'PENDING' | 'READY_FOR_PICKUP' | 'DELIVERED';

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route: string;
  instructions: string | null;
  quantity: number;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // null = tratamiento crónico (sin fecha de fin)
  prescribedBy: string;
  pharmacy: string;
  status: PrescriptionStatus;
  deliveryStatus: DeliveryStatus;
  deliveredAt: Date | null;
}

// Regla de negocio: un medicamento está activo si su estado es ACTIVE
// y su tratamiento no ha finalizado. Las fechas YYYY-MM-DD se comparan como texto.
export function isPrescriptionActive(prescription: Prescription, today: string): boolean {
  return (
    prescription.status === 'ACTIVE' &&
    (prescription.endDate === null || prescription.endDate >= today)
  );
}
