/** Forma con la que httpBase rechaza cualquier error del API. */
export interface ApiError {
  status: number
  message: string
  data?: unknown
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pages: number
}

export type AccountType = 'admin' | 'staff' | 'customer'

/** Lo que devuelve el backapp en /auth/login y /auth/me. */
export interface SessionUser {
  id: string
  email: string
  name: string
  phone: string
  accountType: AccountType | string
  branch: string | null
}

// Contrato completo en roll-it-backapp/docs/API.md. Dinero siempre en centavos.

export interface Ref {
  _id: string
  name: string
}

export interface Branch {
  _id: string
  name: string
  slug: string
  smartmenuUrl: string
  isActive: boolean
  lastSyncAt: string | null
}

export interface Product {
  _id: string
  name: string
  smartmenuCode: string
  category: string
  priceCents: number
  isActive: boolean
  hasRecipe: boolean
}

export type IngredientUnit = 'g' | 'kg' | 'ml' | 'l' | 'unidad'

export interface Ingredient {
  _id: string
  name: string
  unit: IngredientUnit
  costPerUnitCents: number
  defaultMinStock: number
  defaultMaxStock: number
  aliases: string[]
  isActive: boolean
}

export interface IngredientRef extends Ref {
  unit: IngredientUnit
}

export interface Recipe {
  _id: string
  product: Ref & { category: string }
  items: { ingredient: IngredientRef; quantity: number }[]
  notes: string
}

export interface Waiter {
  _id: string
  name: string
  branch: string
  isActive: boolean
}

export interface StaffUser {
  id: string
  email: string
  name: string
  phone: string
  accountType: AccountType
  branch: string | null
  isActive: boolean
}

export type StockStatus = 'out' | 'low' | 'ok' | 'over'

export interface StockRow {
  ingredient: IngredientRef
  branch: Ref
  quantity: number
  minStock: number
  maxStock: number
  status: StockStatus
  daysLeft: number | null
  avgDailyUse: number
}

export type MovementType = 'initial' | 'purchase' | 'sale' | 'adjustment' | 'waste'

export interface Movement {
  _id: string
  branch: Ref
  ingredient: IngredientRef
  type: MovementType
  quantity: number
  note: string
  date: string
  createdBy: Ref | null
}

export interface InvoiceLine {
  rawName: string
  ingredient: IngredientRef | null
  quantity: number
  rawQuantity: number
  rawUnit: string
  unitCostCents: number
  totalCents: number
}

export type InvoiceStatus = 'review' | 'confirmed' | 'rejected'

export interface Invoice {
  _id: string
  branch: Ref
  supplier: string
  invoiceNumber: string
  date: string
  imageUrl: string
  status: InvoiceStatus
  lines: InvoiceLine[]
  totalCents: number
  extractedBy: 'ai' | 'manual'
  aiError: string
  // 'closing': copiada de la caja chica del cierre de mes, sin foto.
  source: 'photo' | 'closing'
  note: string
  createdAt: string
  confirmedAt: string | null
}

export interface SummaryResponse {
  range: { from: string; to: string }
  salesCents: number
  tickets: number
  avgTicketCents: number
  itemsSold: number
  previous: { salesCents: number; tickets: number; avgTicketCents: number }
  byBranch: {
    branch: Ref
    salesCents: number
    tickets: number
    avgTicketCents: number
    share: number
  }[]
  daily: { date: string; salesCents: number; tickets: number }[]
  inventoryAlerts: { out: number; low: number }
  lastSyncAt: string | null
}

export interface Slot {
  weekday: number
  hour: number
  salesCents: number
}

export interface OperationsResponse {
  topProducts: {
    name: string
    category: string
    quantity: number
    salesCents: number
    share: number
  }[]
  byCategory: { category: string; quantity: number; salesCents: number; share: number }[]
  heatmap: { weekday: number; hour: number; salesCents: number; tickets: number }[]
  bestSlot: Slot | null
  worstOpenSlot: Slot | null
}

export interface WaiterStats {
  waiter: Ref
  branch: Ref
  // null cuando la fuente es el cierre de mes: no trae venta en $ por mesera.
  salesCents: number | null
  // Tickets de SmartMenu, o mesas atendidas si la fuente es el cierre.
  tickets: number
  avgTicketCents: number | null
  itemsPerTicket: number
  ticketsPerDay: number
  share: number | null
  daysWorked: number
  score: number
  level: 'top' | 'ok' | 'attention'
  reasons: string[]
}

export type WaiterMetric = 'avgTicket' | 'ticketsPerDay' | 'itemsPerTicket'
export type WaiterSource = 'tickets' | 'closings' | 'none'

export interface WaitersResponse {
  source: WaiterSource
  metrics: WaiterMetric[]
  closingsRange: { from: string; to: string } | null
  teamAvg: { avgTicketCents: number | null; ticketsPerDay: number; itemsPerTicket: number }
  waiters: WaiterStats[]
}

export interface FinanceResponse {
  monthly: { month: string; salesCents: number; tickets: number; avgTicketCents: number }[]
  currentMonth: {
    month: string
    salesCents: number
    daysElapsed: number
    daysInMonth: number
    projectedCents: number
    lastYearCents: number | null
    vsLastYear: number | null
  }
  yearToDate: { salesCents: number; lastYearSameRangeCents: number | null }
}

/** live: el agente del local avisó hace menos de 10 min; none: nunca se instaló. */
export type AgentState = 'live' | 'offline' | 'none'

export interface AgentInfo {
  state: AgentState
  lastSeenAt: string | null
  version: string
  mode: 'descubrir' | 'carpeta' | 'auto' | ''
  lastError: string
}

export interface SyncStatus {
  branch: Branch
  lastSyncAt: string | null
  salesToday: number
  agent: AgentInfo
}

/** Respuesta de `POST /sync/upload`: lo que dejó cargado el reporte de SmartMenu. */
export interface SalesReportResult {
  branch: { _id: string; name: string; slug: string }
  /** Primera y última venta del reporte (ISO). */
  from: string | null
  to: string | null
  rows: number
  tickets: number
  received: number
  /** Ya estaban cargados igual: no se tocaron. */
  unchanged: number
  created: number
  updated: number
  inventoryApplied: number
  /** Platos creados sin receta. */
  unmappedProducts: string[]
  /** Tickets que faltan por el límite de tiempo del servidor: se sube el mismo archivo otra vez. */
  pending: number
}
