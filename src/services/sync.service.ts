import APIBase from './httpBase'
import type { SalesReportResult, SyncStatus } from '@/types'

// El servidor carga por lotes hasta ~60 s y responde con lo que alcanzó (`pending`).
const UPLOAD_TIMEOUT = 120000

class SyncService extends APIBase {
  async status(): Promise<SyncStatus[]> {
    const { data } = await this.get<SyncStatus[]>('sync/status')
    return data
  }

  /**
   * Sube el reporte de ventas de SmartMenu (.xls, .xlsx o .csv). `branch` (slug) solo hace
   * falta si el archivo no dice de qué local es. `onProgress` recibe 0..1 de lo enviado.
   */
  async upload(
    file: File,
    branch?: string,
    onProgress?: (ratio: number) => void,
  ): Promise<SalesReportResult> {
    const form = new FormData()
    form.append('file', file)
    if (branch) form.append('branch', branch)
    const { data } = await this.post<SalesReportResult>('sync/upload', form, undefined, {
      timeout: UPLOAD_TIMEOUT,
      onUploadProgress: (e) => onProgress?.(e.total ? e.loaded / e.total : 0),
    })
    return data
  }
}

export const syncService = new SyncService()
