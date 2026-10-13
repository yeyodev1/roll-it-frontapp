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
  byBranch: { branch: Ref; salesCents: number; tickets: number; avgTicketCents: number; share: number }[]
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
  topProducts: { name: string; category: string; quantity: number; salesCents: number; share: number }[]
  byCategory: { category: string; quantity: number; salesCents: number; share: number }[]
  heatmap: { weekday: number; hour: number; salesCents: number; tickets: number }[]
  bestSlot: Slot | null
  worstOpenSlot: Slot | null
}

export interface WaiterStats {
  waiter: Ref
  branch: Ref
  salesCents: number
  tickets: number
  avgTicketCents: number
  itemsPerTicket: number
  ticketsPerDay: number
  share: number
  daysWorked: number
  score: number
  level: 'top' | 'ok' | 'attention'
  reasons: string[]
}

export interface WaitersResponse {
  teamAvg: { avgTicketCents: number; ticketsPerDay: number; itemsPerTicket: number }
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

export interface SyncStatus {
  branch: Branch
  lastSyncAt: string | null
  salesToday: number
}
