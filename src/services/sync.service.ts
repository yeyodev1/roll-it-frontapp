import APIBase from './httpBase'
import type { SyncStatus } from '@/types'

class SyncService extends APIBase {
  async status(): Promise<SyncStatus[]> {
    const { data } = await this.get<SyncStatus[]>('sync/status')
    return data
  }
}

export const syncService = new SyncService()
