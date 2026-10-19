export type PrescriptionStatus = 'ACTIVE' | 'COMPLETED' | 'SUSPENDED';
export type DeliveryStatus = 'PENDING' | 'READY_FOR_PICKUP' | 'DELIVERED';

// GET /prescriptions/active
export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route: string;
  instructions: string | null;
  quantity: number;
  startDate: string; // AAAA-MM-DD
  endDate: string | null; // null = tratamiento continuo
  prescribedBy: string;
  pharmacy: string;
  status: PrescriptionStatus;
  deliveryStatus: DeliveryStatus;
  deliveredAt: string | null;
}
