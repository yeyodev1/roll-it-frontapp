import { site } from '@/config/site'
import { shiftDay } from '@/stores/filters'

/** Celda del calendario: un día, sepa o no del mes que se está mirando. */
export interface CalendarDay {
  key: string
  day: number
  inMonth: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')

export function toKey(year: number, month0: number, day: number): string {
  const d = new Date(Date.UTC(year, month0, day))
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

export function parseKey(key: string): { year: number; month0: number; day: number } {
  const [y, m, d] = key.split('-').map(Number)
  return { year: y ?? 2000, month0: (m ?? 1) - 1, day: d ?? 1 }
}

/** 'YYYY-MM' del mes que contiene la fecha. */
export const monthOf = (key: string) => key.slice(0, 7)

export function shiftMonth(month: string, delta: number): string {
  const { year, month0 } = parseKey(`${month}-01`)
  return toKey(year, month0 + delta, 1).slice(0, 7)
}

/** Lunes de la semana de esa fecha (la semana empieza en lunes). */
function weekStart(key: string): string {
  const { year, month0, day } = parseKey(key)
  const weekday = (new Date(Date.UTC(year, month0, day)).getUTCDay() + 6) % 7
  return shiftDay(key, -weekday)
}

/**
 * Seis semanas de siete días, siempre: el calendario no cambia de alto entre
 * meses y no salta el layout.
 */
export function monthMatrix(month: string): CalendarDay[][] {
  const first = `${month}-01`
  let cursor = weekStart(first)
  const weeks: CalendarDay[][] = []
  for (let w = 0; w < 6; w++) {
    const week: CalendarDay[] = []
    for (let d = 0; d < 7; d++) {
      week.push({ key: cursor, day: parseKey(cursor).day, inMonth: monthOf(cursor) === month })
      cursor = shiftDay(cursor, 1)
    }
    weeks.push(week)
  }
  return weeks
}

export function monthTitle(month: string): string {
  const { year, month0 } = parseKey(`${month}-01`)
  return `${site.ui.calendar.months[month0]} ${year}`
}

const short = new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const long = new Intl.DateTimeFormat('es-EC', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})
const spoken = new Intl.DateTimeFormat('es-EC', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const asDate = (key: string) => {
  const { year, month0, day } = parseKey(key)
  return new Date(Date.UTC(year, month0, day))
}

/** '2026-09-30' → '30 sep 2026' */
export const formatDay = (key: string) => long.format(asDate(key)).replace('.', '')
/** '2026-09-30' → 'miércoles, 30 de septiembre de 2026' (para lectores de pantalla). */
export const spokenDay = (key: string) => spoken.format(asDate(key))

/** '1 sep – 30 sep 2026'; si cruza de año, los dos llevan año. */
export function formatRange(from: string, to: string): string {
  if (from === to) return formatDay(from)
  const sameYear = from.slice(0, 4) === to.slice(0, 4)
  const start = sameYear ? short.format(asDate(from)).replace('.', '') : formatDay(from)
  return `${start} – ${formatDay(to)}`
}

/** Fecha dentro de [min, max]; cualquiera de los dos puede faltar. */
export function inBounds(key: string, min?: string, max?: string): boolean {
  return (!min || key >= min) && (!max || key <= max)
}

export function clampDay(key: string, min?: string, max?: string): string {
  if (min && key < min) return min
  if (max && key > max) return max
  return key
}

// El 31 en un mes de 30 días cae en el último día de ese mes.
function sameDayIn(target: string, key: string): string {
  const { year, month0 } = parseKey(`${target}-01`)
  const last = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate()
  return toKey(year, month0, Math.min(parseKey(key).day, last))
}

/**
 * A qué día se mueve el foco con cada tecla: flechas ±1 día / ±1 semana,
 * Inicio/Fin al lunes/domingo, RePág/AvPág al mismo día del mes vecino.
 */
export function keyTarget(key: string, focused: string): string | null {
  const weekday = (new Date(`${focused}T12:00:00Z`).getUTCDay() + 6) % 7
  const moves: Record<string, () => string> = {
    ArrowLeft: () => shiftDay(focused, -1),
    ArrowRight: () => shiftDay(focused, 1),
    ArrowUp: () => shiftDay(focused, -7),
    ArrowDown: () => shiftDay(focused, 7),
    Home: () => shiftDay(focused, -weekday),
    End: () => shiftDay(focused, 6 - weekday),
    PageUp: () => sameDayIn(shiftMonth(monthOf(focused), -1), focused),
    PageDown: () => sameDayIn(shiftMonth(monthOf(focused), 1), focused),
  }
  return moves[key]?.() ?? null
}
