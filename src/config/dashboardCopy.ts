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

/** "Sáb 13h": para una cifra de tarjeta, donde el día completo no entra. */
export function slotShort(weekday: number, hour: number): string {
  return `${site.weekdaysShort[weekday] ?? ''} ${hourLabel(hour)}`
}

export const dashboardCopy = {
  layout: {
    logout: 'Salir',
    account: 'Mi cuenta',
    more: 'Más',
    closeMenu: 'Cerrar menú',
    openMenu: 'Abrir menú',
    mainNav: 'Navegación principal',
    menu: 'Menú',
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
    lastSale: 'Última venta',
    neverSynced: 'Sin ventas recibidas',
    lastDay: 'Último día',
    financeMonthly: 'Comparación mes a mes',
  },

  // Mientras SmartMenu no mande ventas en vivo, los datos llegan hasta el último día importado.
  dataUntil: {
    label: (day: string) => `Datos hasta el ${day}`,
    notLive: 'SmartMenu aún no está conectado en vivo',
  },

  // Subir a mano el reporte de ventas de SmartMenu (mientras no hay conexión en vivo).
  salesUpload: {
    action: 'Actualizar ventas',
    actionShort: 'Actualizar',
    title: 'Actualizar ventas',
    subtitle: 'Sube el reporte de ventas detallado de SmartMenu',
    drop: 'Arrastra aquí el reporte',
    dropActive: 'Suelta el archivo',
    pick: 'Elegir archivo',
    formats: '.xls, .xlsx o .csv · hasta 15 MB',
    where: '¿Dónde lo exporto?',
    branch: 'Sucursal',
    branchAuto: 'Detectar del archivo',
    uploading: 'Subiendo archivo…',
    processing: 'Cargando ventas…',
    processingHint: 'Puede tardar hasta un minuto',
    done: 'Ventas cargadas',
    doneText: (branch: string, to: string) => `${branch} · hasta el ${to}`,
    partial: 'Falta una parte',
    partialText: (n: number) => `Quedan ${n} tickets por cargar.`,
    continue: 'Continuar',
    continuing: (n: number) => `Cargando lo que falta (vuelta ${n})…`,
    another: 'Subir otro',
    close: 'Listo',
    range: 'Fechas del reporte',
    tickets: 'Tickets',
    created: 'Nuevos',
    updated: 'Actualizados',
    unchanged: 'Sin cambios',
    unmapped: (n: number) => (n === 1 ? '1 plato sin receta' : `${n} platos sin receta`),
    unmappedHint: 'Se venden, pero no descuentan inventario hasta que les pongas receta.',
    toRecipes: 'Ir a recetas',
    wrongType: 'Sube el reporte de SmartMenu (.xls, .xlsx o .csv)',
    tooBig: 'El archivo pasa de 15 MB',
    retry: 'Intentar de nuevo',
    toast: (n: number) => (n === 1 ? '1 ticket nuevo cargado' : `${n} tickets nuevos cargados`),
  },

  refresh: {
    updated: 'Actualizado',
    refreshing: 'Actualizando…',
    at: (time: string) => `a las ${time}`,
  },

  // Agente que corre en la PC de cada local y sube las ventas de SmartMenu.
  agent: {
    label: 'Agente',
    states: {
      live: 'En vivo',
      offline: 'Sin conexión',
      none: 'Sin instalar',
    },
    pill: {
      live: 'Agente en vivo',
      offline: 'Agente sin conexión',
      none: 'Agente sin instalar',
    },
    allLive: 'Agentes en vivo',
    someLive: (live: number, total: number) => `Agentes: ${live} de ${total} en vivo`,
    lastSeen: 'Último aviso',
    never: 'Nunca se conectó',
    mode: 'Modo',
    modes: {
      carpeta: 'Vigila descargas',
      auto: 'Automático',
      descubrir: 'Descubrimiento',
    } as Record<string, string>,
    version: 'Versión',
    lastError: 'Último error',
  },

  timeAgo: {
    now: 'hace un momento',
    minutes: (n: number) => `hace ${n} min`,
    hours: (n: number) => `hace ${n} h`,
    days: (n: number) => (n === 1 ? 'hace 1 día' : `hace ${n} días`),
  },

  // Textos de los gráficos propios (lectores de pantalla y tooltip).
  charts: {
    area: 'Gráfico de área',
    bars: 'Gráfico de barras',
    noData: 'Sin datos',
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
    vsPrevious: 'vs período anterior',
    perTicket: 'por ticket',
    daily: 'Venta por día',
    dailyTotal: 'Total del período',
    share: 'Participación',
    shareTotal: 'Total',
    byBranch: 'Por sucursal',
    ranking: 'Ranking de sucursales',
    cols: {
      branch: 'Sucursal',
      sales: 'Venta',
      tickets: 'Tickets',
      avgTicket: 'Ticket prom.',
      share: '% venta',
    },
    alerts: 'Inventario',
    alertsOut: 'Agotados',
    alertsLow: 'Por acabarse',
    alertsOk: 'Todo en orden',
    alertsOkText: 'Ningún insumo bajo el mínimo',
    alertsCta: 'Ver inventario',
    lastSync: 'Última venta recibida',
  },

  finance: {
    title: 'Finanzas',
    monthSold: 'Vendido este mes',
    projection: 'Proyección del mes',
    lastYear: 'Mismo mes, año pasado',
    vsLastYear: 'vs año pasado',
    daysProgress: (elapsed: number, total: number) => `Día ${elapsed} de ${total}`,
    trend: 'Venta mensual',
    ytd: 'Acumulado del año',
    ytdSub: (value: string) => `Año pasado: ${value}`,
    noMonthData: 'Sin ventas este mes todavía',
    noLastYear: 'Sin datos del año pasado',
    table: 'Detalle por mes',
    inProgress: 'En curso',
    cols: {
      month: 'Mes',
      sales: 'Venta',
      tickets: 'Tickets',
      avgTicket: 'Ticket prom.',
      lastYear: 'Año pasado',
      vs: 'Variación',
    },
  },

  operations: {
    title: 'Operaciones',
    best: 'Mejor franja',
    worst: 'Franja más floja',
    star: 'Plato estrella',
    leadCategory: 'Categoría líder',
    otherCategories: 'Otras',
    categoryTotal: 'Venta',
    productCols: {
      name: 'Plato',
      quantity: 'Vendidos',
      sales: 'Venta',
      share: '% venta',
    },
    heatBest: 'Mejor franja',
    heatDayTotal: 'Total',
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
    noFeed: 'Aún no hay datos de meseros',
    noFeedText:
      'Falta el reporte de meseros de SmartMenu: el de ventas no dice quién atendió cada mesa.',
    evaluated: 'Meseros evaluados',
    evaluatedSub: (top: number, attention: number) =>
      `${top} destacados · ${attention} por mejorar`,
    teamAvgSub: 'Promedio del equipo',
    people: (n: number) => (n === 1 ? '1 mesero' : `${n} meseros`),
    ranking: 'Ranking de meseros',
    byLevel: 'Por nivel',
    reasons: 'Por qué',
    cols: {
      name: 'Mesero',
      level: 'Nivel',
      score: 'Puntaje',
      avgTicket: 'Ticket prom.',
      perDay: 'Mesas / día',
      perTicket: 'Platos / mesa',
    },
    days: (n: number) => (n === 1 ? '1 día' : `${n} días`),
    // Cuando los datos salen del cierre de mes (hoja VENTA DIARIA) y no de SmartMenu.
    perTicketClosing: 'Sugeridos / mesa',
    closingsNote:
      'Datos del cierre de mes del local: mesas atendidas y productos sugeridos (cócteles, cervezas, postres, jugos, entradas) por mesera. El cierre no trae venta en $ por mesera, así que el ticket promedio no entra en el puntaje.',
    noDataRange: 'No hay datos de meseros en estas fechas',
    noDataRangeText: (from: string, to: string) =>
      `Los cierres de mes cargados cubren del ${from} al ${to}.`,
    jumpToClosings: 'Ver esas fechas',
    serviceTitle: 'Atención en el período',
    serviceByBranch: 'Atención por sucursal',
    rankingTitle: 'Ranking por mesera',
    noRankingRange: 'Sin ranking por mesera en estas fechas',
    noRankingText: (from: string, to: string) =>
      `El reporte de SmartMenu no dice qué mesera atendió cada mesa. Solo hay cierres de mes del ${from} al ${to}.`,
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
    lead: 'Entra con tu correo y tu contraseña.',
    show: 'Mostrar contraseña',
    hide: 'Ocultar contraseña',
    features: [
      { label: 'Ventas por sucursal', icon: 'fa-solid fa-chart-line' },
      { label: 'Inventario al día', icon: 'fa-solid fa-boxes-stacked' },
      { label: 'Facturas con foto', icon: 'fa-solid fa-camera' },
    ],
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
    passwordHint: 'Mínimo 8 caracteres',
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
