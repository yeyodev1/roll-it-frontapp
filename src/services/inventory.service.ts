import APIBase from './httpBase'
import type { Movement, MovementType, Paginated, StockRow, StockStatus } from '@/types'

export type StockCounts = Record<StockStatus, number>

export interface InventoryResponse {
  rows: StockRow[]
  counts: StockCounts
}

export interface MovementsQuery {
  branch?: string
  ingredient?: string
  type?: MovementType | ''
  page?: number
  limit?: number
}

export interface AdjustPayload {
  branch: string
  ingredient: string
  quantity: number
  type: 'adjustment' | 'waste'
  note: string
}

export interface ThresholdsPayload {
  branch: string
  ingredient: string
  minStock: number
  maxStock: number
}

export interface AskResponse {
  answer: string
  rows: StockRow[]
}

/** Arma el query string sin mandar vacíos: el backend trata `branch=` como "todas". */
function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value))
  })
  const text = search.toString()
  return text ? `?${text}` : ''
}

class InventoryService extends APIBase {
  async list(branch?: string, status?: StockStatus | ''): Promise<InventoryResponse> {
    const { data } = await this.get<InventoryResponse>(`inventory${toQuery({ branch, status })}`)
    return data
  }

  async movements(query: MovementsQuery = {}): Promise<Paginated<Movement>> {
    const { data } = await this.get<Paginated<Movement>>(
      `inventory/movements${toQuery({ ...query })}`,
    )
    return data
  }

  async setInitial(
    branch: string,
    items: { ingredient: string; quantity: number }[],
  ): Promise<{ ok: boolean; updated: number }> {
    const { data } = await this.post<{ ok: boolean; updated: number }>('inventory/initial', {
      branch,
      items,
    })
    return data
  }

  async adjust(payload: AdjustPayload): Promise<StockRow> {
    const { data } = await this.post<StockRow>('inventory/adjust', payload)
    return data
  }

  async setThresholds(payload: ThresholdsPayload): Promise<StockRow> {
    const { data } = await this.put<StockRow>('inventory/thresholds', payload)
    return data
  }

  async ask(q: string, branch?: string): Promise<AskResponse> {
    const { data } = await this.get<AskResponse>(`inventory/ask${toQuery({ q, branch })}`)
    return data
  }
}

export const inventoryService = new InventoryService()
