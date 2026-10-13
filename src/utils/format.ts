const money = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

export function formatMoney(value: number): string {
  return money.format(value)
}

const date = new Intl.DateTimeFormat('es-EC', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(value: string | Date): string {
  return date.format(typeof value === 'string' ? new Date(value) : value)
}

/** El API manda el dinero en centavos para no arrastrar errores de punto flotante. */
export function formatCents(cents: number): string {
  return money.format((cents || 0) / 100)
}

const qty = new Intl.NumberFormat('es-EC', { maximumFractionDigits: 2 })

export function formatQty(value: number, unit = ''): string {
  const text = qty.format(value || 0)
  return unit ? `${text} ${unit}` : text
}

const pct = new Intl.NumberFormat('es-EC', { style: 'percent', maximumFractionDigits: 1 })

/** 0.183 → "18,3 %" */
export function formatPercent(ratio: number): string {
  return pct.format(ratio || 0)
}

/** Variación entre dos valores como ratio con signo; null si no hay base. */
export function variation(current: number, previous: number): number | null {
  if (!previous) return null
  return (current - previous) / previous
}
