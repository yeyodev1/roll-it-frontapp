/**
 * Escalas y trazos de los gráficos SVG propios. Sin dependencias: lo justo para
 * ejes "redondos" y curvas suaves que no se pasan de los datos.
 */

/** Techo "bonito" para el eje: 1, 2, 2.5, 5 o 10 × potencia de 10. */
export function niceCeil(value: number): number {
  if (value <= 0) return 1
  const exp = 10 ** Math.floor(Math.log10(value))
  const f = value / exp
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10
  return nice * exp
}

/** Máximo del eje y sus marcas (de arriba hacia abajo), con `steps` divisiones. */
export function axisTicks(values: (number | null | undefined)[], steps = 4) {
  const top = niceCeil(Math.max(0, ...values.map((v) => v ?? 0)))
  const ticks = Array.from({ length: steps + 1 }, (_, i) => (top * (steps - i)) / steps)
  return { max: top, ticks }
}

export interface Pt {
  x: number
  y: number
}

/**
 * Curva monótona (Fritsch–Carlson): suave como un spline pero sin "pasarse"
 * por encima o por debajo de los puntos, así un pico no inventa ventas.
 */
export function smoothPath(points: Pt[]): string {
  const n = points.length
  if (!n) return ''
  if (n === 1) return `M${points[0]!.x},${points[0]!.y}`
  const dx: number[] = []
  const m: number[] = []
  for (let i = 0; i < n - 1; i++) {
    const a = points[i]!
    const b = points[i + 1]!
    dx.push(b.x - a.x)
    m.push((b.y - a.y) / (b.x - a.x || 1))
  }
  const t: number[] = [m[0]!]
  for (let i = 1; i < n - 1; i++) {
    const prev = m[i - 1]!
    const next = m[i]!
    t.push(
      prev * next <= 0
        ? 0
        : (3 * (dx[i - 1]! + dx[i]!)) /
            ((2 * dx[i]! + dx[i - 1]!) / prev + (dx[i]! + 2 * dx[i - 1]!) / next),
    )
  }
  t.push(m[n - 2]!)
  let d = `M${points[0]!.x.toFixed(1)},${points[0]!.y.toFixed(1)}`
  for (let i = 0; i < n - 1; i++) {
    const a = points[i]!
    const b = points[i + 1]!
    const h = dx[i]! / 3
    d += ` C${(a.x + h).toFixed(1)},${(a.y + h * t[i]!).toFixed(1)} ${(b.x - h).toFixed(1)},${(b.y - h * t[i + 1]!).toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`
  }
  return d
}

/** Barra con las dos esquinas de arriba redondeadas y la base recta sobre el eje. */
export function roundedTopBar(x: number, y: number, w: number, h: number, r: number): string {
  if (h <= 0 || w <= 0) return ''
  const rr = Math.min(r, w / 2, h)
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`
}

/** Colores de serie fijos por posición (sucursal 1, 2, 3…), definidos en global.scss. */
export const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)']
export const chartColor = (i: number) => CHART_COLORS[i % CHART_COLORS.length]!
