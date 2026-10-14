/**
 * El copy es configuración: todos los textos del panel viven acá.
 * Los componentes solo consumen y pintan.
 *
 * Wilson pidió poco texto en pantalla: cada métrica muestra el número y su
 * explicación va en `help`, detrás de un botón (i).
 */
export const site = {
  name: 'Roll It',
  tagline: 'Tu negocio en tiempo real',
  description: 'Panel de Roll It: ventas, meseros e inventario de las sucursales.',
  url: 'https://roll-it-frontapp.vercel.app',
  email: '',
  whatsapp: '',
  social: {
    instagram: '',
    facebook: '',
    tiktok: '',
  },

  // Navegación del panel. `adminOnly` la oculta al personal de sucursal.
  nav: [
    { label: 'CEO', to: '/panel', icon: 'fa-solid fa-gauge-high', adminOnly: true },
    { label: 'Finanzas', to: '/finanzas', icon: 'fa-solid fa-sack-dollar', adminOnly: true },
    { label: 'Operaciones', to: '/operaciones', icon: 'fa-solid fa-fire-burner', adminOnly: true },
    { label: 'Meseros', to: '/meseros', icon: 'fa-solid fa-user-tie', adminOnly: true },
    { label: 'Inventario', to: '/inventario', icon: 'fa-solid fa-boxes-stacked', adminOnly: false },
    { label: 'Facturas', to: '/facturas', icon: 'fa-solid fa-receipt', adminOnly: false },
    { label: 'Recetas', to: '/recetas', icon: 'fa-solid fa-book-open', adminOnly: true },
    { label: 'Ajustes', to: '/ajustes', icon: 'fa-solid fa-gear', adminOnly: true },
  ],

  ranges: [
    { label: 'Hoy', value: 'today' },
    { label: '7 días', value: '7d' },
    { label: '30 días', value: '30d' },
    { label: 'Este mes', value: 'month' },
  ],

  // Textos de los controles propios (selector, calendario, skeleton). Sin selectores nativos.
  ui: {
    loading: 'Cargando…',
    retry: 'Reintentar',
    close: 'Cerrar',
    // Lectores de pantalla: la flecha de color se lee como texto.
    delta: {
      up: (pct: string) => `subió ${pct}`,
      down: (pct: string) => `bajó ${pct}`,
    },
    select: {
      placeholder: 'Elegir',
      search: 'Buscar',
      empty: 'Sin resultados',
    },
    calendar: {
      placeholder: 'Elegir fecha',
      rangePlaceholder: 'Elegir fechas',
      prevMonth: 'Mes anterior',
      nextMonth: 'Mes siguiente',
      today: 'Hoy',
      apply: 'Aplicar',
      clear: 'Limpiar',
      pickStart: 'Toca el día de inicio',
      pickEnd: 'Ahora toca el día final',
      // Lunes primero, como se usa en Ecuador.
      weekdays: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      weekdaysNarrow: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
      months: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ],
    },
  },

  weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],

  stockStatus: {
    out: { label: 'Agotado', icon: 'fa-solid fa-circle-xmark' },
    low: { label: 'Por acabarse', icon: 'fa-solid fa-triangle-exclamation' },
    ok: { label: 'Óptimo', icon: 'fa-solid fa-circle-check' },
    over: { label: 'Sobrestock', icon: 'fa-solid fa-layer-group' },
  },

  movementTypes: {
    initial: 'Inventario inicial',
    purchase: 'Compra',
    sale: 'Venta',
    adjustment: 'Ajuste',
    waste: 'Merma',
  },

  waiterLevels: {
    top: 'Destacado',
    ok: 'En línea',
    attention: 'Requiere atención',
  },

  invoiceStatus: {
    review: 'Por revisar',
    confirmed: 'Confirmada',
    rejected: 'Rechazada',
  },

  // Explicaciones detrás del botón (i). Cortas: una o dos frases.
  help: {
    sales: 'Total facturado en SmartMenu en el período, sin anulados.',
    tickets: 'Cantidad de cuentas cobradas.',
    avgTicket: 'Venta dividida para el número de tickets: cuánto deja en promedio cada mesa.',
    itemsSold: 'Platos y bebidas vendidos.',
    vsPrevious: 'Comparado con el mismo número de días justo antes.',
    byBranch: 'Cuánto aporta cada sucursal a la venta total.',
    ranking: 'Sucursales ordenadas por venta en el período elegido.',
    daily: 'Venta de cada día del período. Pasa el dedo o el mouse para ver el monto.',
    monthly: 'Venta de cada mes de este año (color) junto al mismo mes del año pasado (gris).',
    monthTable: 'Cada mes de este año contra el mismo mes del año pasado.',
    ytd: 'Venta desde el 1 de enero hasta hoy, contra el mismo tramo del año pasado.',
    inventoryAlerts: 'Insumos agotados o por debajo del mínimo en las sucursales.',
    topProducts: 'Lo que más dinero deja, no solo lo que más unidades vende.',
    heatmap:
      'Venta por día y hora. Más oscuro = más venta. Sirve para decidir horarios de apertura y turnos.',
    worstSlot: 'La franja abierta que menos vende: candidata a cerrar o a promocionar.',
    waiterScore:
      'Compara a cada mesero con el promedio de su sucursal: ticket promedio (40%), mesas por día (35%) y platos por mesa (25%). 50 = igual al equipo.',
    projection:
      'Lo vendido en el mes dividido para los días transcurridos, multiplicado por los días del mes.',
    vsLastYear: 'Proyección del mes contra lo vendido el mismo mes del año pasado.',
    daysLeft: 'Días que alcanza el stock al ritmo de consumo de las últimas dos semanas.',
    stockStatus:
      'Agotado: sin stock. Por acabarse: bajo el mínimo. Óptimo: entre mínimo y máximo. Sobrestock: sobre el máximo.',
    invoices:
      'Toma una foto de la factura del proveedor. El sistema lee los productos y, cuando confirmas, se suman al inventario.',
    recipesImport:
      'Excel o CSV con las columnas Plato, Ingrediente, Cantidad y Unidad. Cada venta descuenta del inventario según su receta.',
    salesUpload:
      'En SmartMenu: Reportes → Ventas detallado → exportar a Excel, y súbelo aquí. Se puede subir el mismo archivo varias veces sin duplicar.',
    sync: 'Las ventas llegan desde el SmartMenu de cada sucursal. Si el equipo del local está apagado, se actualizan cuando se vuelva a prender.',
  },
} as const

export function whatsappLink(message = 'Hola, quiero más información'): string {
  if (!site.whatsapp) return '#'
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`
}
