// Entidad de dominio: paciente y sus contactos de emergencia

export type Sex = 'FEMALE' | 'MALE';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Patient {
  id: string;
  nationalId: string; // Cédula solo con dígitos
  firstName: string;
  lastName: string;
  birthDate: string; // Fecha sin hora en formato YYYY-MM-DD
  sex: Sex;
  bloodType: BloodType;
  phone: string | null;
  address: string | null;
  healthArea: string | null;
}

export interface EmergencyContact {
  id: string;
  fullName: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

// Regla de negocio: nombre completo para mostrar
export function getFullName(patient: Pick<Patient, 'firstName' | 'lastName'>): string {
  return `${patient.firstName} ${patient.lastName}`;
}

// Regla de negocio: edad cumplida a una fecha dada (se calcula, no se guarda)
export function calculateAge(birthDate: string, today: Date): number {
  const [year, month, day] = birthDate.split('-').map(Number);
  let age = today.getFullYear() - year;
  const birthdayPassed =
    today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!birthdayPassed) age -= 1;
  return age;
}
