/**
 * Copy del layout y de las vistas del panel (CEO, Finanzas, Operaciones, Meseros).
 * Complementa a `site.ts`: lo que vive acá es exclusivo de estas pantallas.
 * Las explicaciones largas siguen en `site.help` y salen detrás del (i).
 */
import { site } from './site'

function hourLabel(hour: number): string {
  return `${hour}h`
}

export function slotLabel(weekday: number, hour: number): string {
  return `${site.weekdays[weekday] ?? ''} ${hourLabel(hour)}`
}

export const dashboardCopy = {
  layout: {
    logout: 'Salir',
    account: 'Mi cuenta',
    more: 'Más',
    closeMenu: 'Cerrar menú',
    openMenu: 'Abrir menú',
    mainNav: 'Navegación principal',
  },

  filters: {
    branch: 'Sucursal',
    allBranches: 'Todas',
    range: 'Rango de fechas',
    custom: 'Fechas',
    from: 'Desde',
    to: 'Hasta',
    apply: 'Aplicar',
    updated: 'Actualizado',
    neverSynced: 'Sin ventas recibidas',
  },

  timeAgo: {
    now: 'hace un momento',
    minutes: (n: number) => `hace ${n} min`,
    hours: (n: number) => `hace ${n} h`,
    days: (n: number) => (n === 1 ? 'hace 1 día' : `hace ${n} días`),
  },

  states: {
    loadError: 'No se pudieron cargar los datos',
    retry: 'Reintentar',
    noData: 'Sin ventas en estas fechas',
    noDataText: 'Prueba con otro rango o con todas las sucursales.',
  },

  ceo: {
    title: 'Panel CEO',
    sales: 'Venta',
    tickets: 'Tickets',
    avgTicket: 'Ticket promedio',
    itemsSold: 'Ítems vendidos',
    daily: 'Venta por día',
    byBranch: 'Por sucursal',
    alerts: 'Inventario',
    alertsOut: 'agotados',
    alertsLow: 'por acabarse',
    alertsOk: 'Todo en orden',
    alertsCta: 'Ver inventario',
    lastSync: 'Última venta recibida',
  },

  finance: {
    title: 'Finanzas',
    monthSold: 'Vendido este mes',
    projection: 'Proyección del mes',
    lastYear: 'Mismo mes, año pasado',
    daysProgress: (elapsed: number, total: number) => `Día ${elapsed} de ${total}`,
    trend: 'Venta mensual',
    thisYear: 'Últimos 12 meses',
    prevYear: 'Año anterior',
    ytd: 'Acumulado del año',
    ytdLastYear: 'Año pasado a la misma fecha',
    noLastYear: 'Sin datos del año pasado',
  },

  operations: {
    title: 'Operaciones',
    best: 'Mejor hora',
    worst: 'Hora más floja',
    bestSentence: (weekday: number, hour: number) => `${slotLabel(weekday, hour)} es tu mejor hora`,
    worstSentence: (weekday: number, hour: number) =>
      `${slotLabel(weekday, hour)} es tu hora más floja`,
    heatmap: 'Venta por día y hora',
    topProducts: 'Lo que más deja',
    byCategory: 'Por categoría',
    units: (n: number) => `${n} vendidos`,
    heatLess: 'Menos',
    heatMore: 'Más',
    heatTap: 'Toca un cuadro para ver el detalle',
    heatCell: (weekday: number, hour: number, money: string, tickets: number) =>
      `${slotLabel(weekday, hour)} · ${money} · ${tickets} tickets`,
  },

  waiters: {
    title: 'Meseros',
    teamAvg: 'Promedio del equipo',
    avgTicket: 'Ticket prom.',
    perDay: 'Mesas / día',
    perTicket: 'Platos / mesa',
    all: 'Todos',
    attentionFirst: 'Requieren atención',
    topOnly: 'Destacados',
    score: 'Puntaje',
    empty: 'Sin meseros con suficientes mesas',
    emptyText: 'Se necesitan al menos 10 tickets en el período para evaluar a un mesero.',
    days: (n: number) => (n === 1 ? '1 día' : `${n} días`),
  },

  login: {
    eyebrow: 'Panel',
    title: 'Ingresar',
    email: 'Correo',
    password: 'Contraseña',
    submit: 'Ingresar',
    loading: 'Ingresando…',
    hello: (name: string) => `Hola, ${name}`,
    brandLine: 'Rolls y burritos · 3 sucursales',
  },

  account: {
    title: 'Mi cuenta',
    email: 'Correo',
    role: 'Tipo de cuenta',
    branch: 'Sucursal',
    roles: { admin: 'Dueño', staff: 'Personal de sucursal', customer: 'Cliente' } as Record<
      string,
      string
    >,
    allBranches: 'Todas',
    passwordTitle: 'Cambiar contraseña',
    current: 'Contraseña actual',
    next: 'Nueva contraseña',
    confirm: 'Repite la nueva',
    mismatch: 'Las contraseñas nuevas no coinciden',
    tooShort: 'La nueva contraseña debe tener al menos 8 caracteres',
    save: 'Guardar contraseña',
    saved: 'Contraseña actualizada',
    logout: 'Cerrar sesión',
    loggedOut: 'Sesión cerrada',
  },
}
