import { defineStore } from 'pinia'
import type { Branch } from '@/types'

// Ecuador continental está en UTC-5 todo el año: el día de negocio no depende
// de la zona horaria del navegador ni del servidor.
const ECUADOR_OFFSET_MS = -5 * 3600_000

/** Fecha 'YYYY-MM-DD' en Ecuador del instante dado. */
export function ecuadorDay(value: Date | string = new Date()): string {
  const time = typeof value === 'string' ? new Date(value).getTime() : value.getTime()
  return new Date(time + ECUADOR_OFFSET_MS).toISOString().slice(0, 10)
}

/** Suma días a una fecha 'YYYY-MM-DD' sin pasar por la zona horaria local. */
export function shiftDay(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y ?? 2000, (m ?? 1) - 1, (d ?? 1) + days)).toISOString().slice(0, 10)
}

export type RangePreset = 'today' | '7d' | '30d' | 'month' | 'custom'

function presetRange(preset: Exclude<RangePreset, 'custom'>, end: string) {
  if (preset === 'today') return { from: end, to: end }
  if (preset === '7d') return { from: shiftDay(end, -6), to: end }
  if (preset === 'month') return { from: `${end.slice(0, 8)}01`, to: end }
  return { from: shiftDay(end, -29), to: end }
}

/** Día de la última venta recibida entre todas las sucursales, o null si nunca llegó una. */
function lastSaleDay(branches: Branch[]): string | null {
  const days = branches.map((b) => b.lastSyncAt).filter((d): d is string => Boolean(d))
  if (!days.length) return null
  return days.map((d) => ecuadorDay(d)).reduce((a, b) => (a > b ? a : b))
}

const initial = presetRange('30d', ecuadorDay())

/**
 * Sucursal y rango de fechas compartidos por todas las vistas del panel: si el
 * dueño elige "Villa Club · últimos 7 días" en el CEO, Meseros abre igual.
 *
 * Mientras SmartMenu no mande ventas en vivo, los datos se quedan en el último
 * día importado. Los presets se anclan a ese día (`dataUntil`) para que "Hoy"
 * o "7 días" no salgan en cero; cuando lleguen ventas de hoy vuelven solos a hoy.
 */
export const useFiltersStore = defineStore('filters', {
  state: () => ({
    branch: 'all' as string,
    from: initial.from,
    to: initial.to,
    preset: '30d' as RangePreset,
    branches: [] as Branch[],
    dataUntil: null as string | null,
    // Las vistas esperan a tener sucursales antes de pedir datos: así el rango
    // ya está anclado y no se dispara una carga con fechas que luego cambian.
    ready: false,
  }),

  getters: {
    query: (s) => ({ branch: s.branch, from: s.from, to: s.to }),
    queryString(): string {
      return new URLSearchParams(this.query).toString()
    },
    branchName: (s) => s.branches.find((b) => b._id === s.branch)?.name || 'Todas las sucursales',
    today: () => ecuadorDay(),
    /** true si la última venta es de antes de hoy: los datos no están al día. */
    isBehind(): boolean {
      return Boolean(this.dataUntil && this.dataUntil < this.today)
    },
    /** Último día que tiene sentido mirar: hoy, o el último día con ventas. */
    anchor(): string {
      return this.isBehind ? this.dataUntil! : this.today
    },
  },

  actions: {
    setPreset(preset: RangePreset) {
      this.preset = preset
      if (preset === 'custom') return
      const range = presetRange(preset, this.anchor)
      // Solo se escribe lo que cambia: escribir el mismo valor no recarga nada.
      if (this.from !== range.from) this.from = range.from
      if (this.to !== range.to) this.to = range.to
    },

    setRange(from: string, to: string) {
      this.preset = 'custom'
      this.from = from
      this.to = to
    },

    setBranches(branches: Branch[]) {
      this.branches = branches
      this.dataUntil = lastSaleDay(branches)
      // El rango personalizado es decisión del dueño: no se toca.
      if (this.preset !== 'custom') this.setPreset(this.preset)
      this.ready = true
    },

    /** Sin sucursales (falló la carga): las vistas igual cargan con el rango que haya. */
    markReady() {
      this.ready = true
    },

    reset() {
      this.$reset()
    },
  },
})
