import APIBase from './httpBase'
import type { FinanceResponse, OperationsResponse, SummaryResponse, WaitersResponse } from '@/types'

/** Lo mismo que `filtersStore.query`: sucursal (o 'all') y rango YYYY-MM-DD. */
export interface DashboardQuery {
  branch: string
  from: string
  to: string
}

function qs(query: DashboardQuery): string {
  return new URLSearchParams({ ...query }).toString()
}

class DashboardService extends APIBase {
  async summary(query: DashboardQuery): Promise<SummaryResponse> {
    const { data } = await this.get<SummaryResponse>(`dashboard/summary?${qs(query)}`)
    return data
  }

  async operations(query: DashboardQuery): Promise<OperationsResponse> {
    const { data } = await this.get<OperationsResponse>(`dashboard/operations?${qs(query)}`)
    return data
  }

  async waiters(query: DashboardQuery): Promise<WaitersResponse> {
    const { data } = await this.get<WaitersResponse>(`dashboard/waiters?${qs(query)}`)
    return data
  }

  async finance(query: DashboardQuery): Promise<FinanceResponse> {
    const { data } = await this.get<FinanceResponse>(`dashboard/finance?${qs(query)}`)
    return data
  }
}

export const dashboardService = new DashboardService()
