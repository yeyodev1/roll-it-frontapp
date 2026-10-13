/**
 * Formatos cortos para ejes y celdas chicas, donde "$12.345,67" no entra.
 * El monto completo sigue saliendo en el tooltip con formatCents.
 */
const compact = new Intl.NumberFormat('es-EC', { notation: 'compact', maximumFractionDigits: 1 })

/** 1234567 centavos → "$12,3 mil" */
export function compactCents(cents: number): string {
  return `$${compact.format((cents || 0) / 100)}`
}

const monthShort = new Intl.DateTimeFormat('es-EC', { month: 'short' })
const dayMonth = new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short' })

/** "2026-03" → "mar" (fecha local, sin corrimiento por zona horaria) */
export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return monthShort.format(new Date(y ?? 2000, (m ?? 1) - 1, 1)).replace('.', '')
}

/** "2026-03" → "mar 2026" */
export function monthYearLabel(key: string): string {
  return `${monthLabel(key)} ${key.slice(0, 4)}`
}

/** "2026-03-14" → "14 mar" */
export function dayLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return dayMonth.format(new Date(y ?? 2000, (m ?? 1) - 1, d ?? 1)).replace('.', '')
}
