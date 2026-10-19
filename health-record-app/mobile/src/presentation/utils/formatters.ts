// Formato de fechas y datos para mostrar en español (sin depender de Intl)

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// "1985-03-14" → "14 mar 1985" (fechas sin hora: no se convierten a zona horaria)
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

// Hora local del dispositivo en formato 12 h: "8:30 a. m."
export function formatTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours < 12 ? 'a. m.' : 'p. m.';
  return `${hours % 12 === 0 ? 12 : hours % 12}:${minutes} ${suffix}`;
}

// Fecha local de un valor con hora: "2026-06-16T13:50:00Z" → "16 jun 2026"
export function formatLocalDate(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// "18 oct 2026, 8:30 a. m."
export function formatDateTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${formatTime(isoDateTime)}`;
}

// Partes de la fecha para el bloque de calendario de las citas
export function getDateParts(isoDateTime: string) {
  const date = new Date(isoDateTime);
  return {
    day: String(date.getDate()),
    month: MONTHS[date.getMonth()].toUpperCase(),
    weekday: WEEKDAYS[date.getDay()],
    year: String(date.getFullYear()),
  };
}

// "112340567" → "1-1234-0567" (formato de cédula física costarricense)
export function formatNationalId(nationalId: string): string {
  return /^\d{9}$/.test(nationalId)
    ? `${nationalId[0]}-${nationalId.slice(1, 5)}-${nationalId.slice(5)}`
    : nationalId;
}

// Máscara de fecha mientras se escribe: "19780721" → "1978-07-21"
export function maskIsoDate(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
