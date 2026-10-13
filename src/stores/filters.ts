import { defineStore } from 'pinia'
import type { Branch } from '@/types'

function dayKey(date: Date): string {
  // Fecha local del navegador (el dueño está en Ecuador): no usar toISOString, que sería UTC.
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return dayKey(date)
}

export type RangePreset = 'today' | '7d' | '30d' | 'month' | 'custom'

/**
 * Sucursal y rango de fechas compartidos por todas las vistas del panel: si el
 * dueño elige "Villa Club · últimos 7 días" en el CEO, Meseros abre igual.
 */
export const useFiltersStore = defineStore('filters', {
  state: () => ({
    branch: 'all' as string,
    from: daysAgo(29),
    to: dayKey(new Date()),
    preset: '30d' as RangePreset,
    branches: [] as Branch[],
  }),

  getters: {
    query: (s) => ({ branch: s.branch, from: s.from, to: s.to }),
    queryString(): string {
      return new URLSearchParams(this.query).toString()
    },
    branchName: (s) => s.branches.find((b) => b._id === s.branch)?.name || 'Todas las sucursales',
  },

  actions: {
    setPreset(preset: RangePreset) {
      this.preset = preset
      const today = new Date()
      if (preset === 'today') this.from = dayKey(today)
      if (preset === '7d') this.from = daysAgo(6)
      if (preset === '30d') this.from = daysAgo(29)
      if (preset === 'month') this.from = dayKey(new Date(today.getFullYear(), today.getMonth(), 1))
      if (preset !== 'custom') this.to = dayKey(today)
    },

    setRange(from: string, to: string) {
      this.preset = 'custom'
      this.from = from
      this.to = to
    },

    setBranches(branches: Branch[]) {
      this.branches = branches
    },
  },
})
