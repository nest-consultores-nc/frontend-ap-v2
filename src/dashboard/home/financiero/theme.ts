// Colores y formatos del dashboard financiero.
// Los colores de los gráficos son los mismos del reporte de Power BI
// "02. Polux Polaris" (tema "Custom" y colores fijados en cada visual).

export const INK = {
  primary: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  surface: '#ffffff',
}

/** Paleta del reporte de Power BI, por página y gráfico */
export const PBI = {
  /** fondo de página del reporte */
  page: '#EDEBE5',
  ink: '#252423',
  /** colores del tema, en el orden que Power BI los asigna (sin blanco ni #EDEBE5, que no se ven sobre fondo claro) */
  theme: ['#303030', '#FF735C', '#CDEA80', '#BDDEFF', '#4A4A4A', '#8A8A8A'],

  // Resumen
  utilidad: '#5A6EFF',
  ingreso: '#60CD31',
  productividad: '#60CD31',
  comboIngreso: '#ABFF88',
  comboIngresoBorde: '#2C9200',
  comboCosto: '#FF735C',
  margen: '#252423',

  // Utilidades
  azul: '#4D8ECB',
  rentabilidadProyecto: ['#8A8A8A', '#57A9FA'],
  tiposUtilidad: {
    'Proyecto Recurrente': '#6975CD',
    'Proyecto no Recurrente': '#65AFF7',
  } as Record<string, string>,
  /** tonos azules del mismo gráfico, para tipos sin color fijo en Power BI */
  tiposUtilidadResto: ['#4D8ECB', '#482DAB', '#538FC7', '#85ABF6'],

  // Ingresos
  evolucionIngresos: '#9AB060',
  tendenciaIngresos: '#5DC160',
  ingresosProyecto: ['#ebf7cc', '#29E355'],
  ingresosCliente: ['#d7ee99', '#18C354', '#00751B'],
  tiposIngreso: ['#5DC160', '#02B148', '#1B8E29', '#55E071'],

  // Costos
  directo: '#303030',
  indirecto: '#FF735C',
  /** en el área y en la tendencia, Power BI usa un coral más claro */
  indirectoClaro: '#FF8F7D',
  salarial: '#FEE5BD',

  // Clientes
  utilidadCliente: ['#FD3A1A', '#F0FF65', '#00E450'],
  cantidadClientes: ['#BDDEFF', '#07A8FF'],
}

export const WATERFALL = {
  up: '#5DC160',
  down: '#FF7660',
  total: '#4D8ECB',
}

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const rgbToHex = (rgb: number[]) =>
  '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')
const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  return rgbToHex(A.map((c, i) => c + (B[i] - c) * t))
}

/**
 * Degradado como el formato condicional de Power BI: el valor mínimo toma el
 * primer color y el máximo el último (con 3 colores, el del medio va al centro).
 */
export const gradient = (stops: string[], values: number[]) => {
  const min = Math.min(...values)
  const max = Math.max(...values)
  return (v: number) => {
    const t = max === min ? 1 : (v - min) / (max - min)
    if (stops.length === 2) return mix(stops[0], stops[1], t)
    return t <= 0.5 ? mix(stops[0], stops[1], t * 2) : mix(stops[1], stops[2], (t - 0.5) * 2)
  }
}

/** Texto blanco o negro según lo claro que sea el fondo */
export const inkOn = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const x = c / 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? INK.primary : '#ffffff'
}

const clpFull = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

const dec1 = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 })

/** $1,2 M (millones) o $850 mil; los miles de millones quedan como $2.017,6 M */
const clpCompact = (v: number) => {
  const a = Math.abs(v)
  if (a >= 1e6) return `${dec1.format(v / 1e6)} M`
  if (a >= 1e3) return `${dec1.format(v / 1e3)} mil`
  return dec1.format(v)
}

const pct = new Intl.NumberFormat('es-CL', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const int = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 })

export const fmt = {
  clp: (v: number) => clpFull.format(v),
  clpShort: (v: number) => (v < 0 ? `-$${clpCompact(-v)}` : `$${clpCompact(v)}`),
  pct: (v: number | null) => (v === null || !isFinite(v) ? '—' : pct.format(v)),
  int: (v: number) => int.format(v),
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/** '2025-03' → 'mar 2025' */
export const periodLabel = (period: string) => {
  const [y, m] = period.split('-')
  return `${MONTHS[Number(m) - 1]} ${y}`
}

/** Opciones comunes de ejes, grilla y tooltip para ECharts */
export const axisStyle = {
  axisLine: { lineStyle: { color: INK.axis } },
  axisTick: { show: false },
  axisLabel: { color: INK.muted, fontSize: 11 },
  splitLine: { lineStyle: { color: INK.grid, type: 'solid' as const } },
}

export const tooltipStyle = {
  backgroundColor: '#ffffff',
  borderColor: 'rgba(11,11,11,0.10)',
  borderWidth: 1,
  padding: [8, 10],
  textStyle: { color: INK.primary, fontSize: 12 },
  extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-radius: 8px;',
}

/** Fila de tooltip: trazo corto del color de la serie, valor destacado y nombre secundario */
export const tooltipRow = (color: string, name: string, value: string) =>
  `<div style="display:flex;align-items:center;gap:8px;margin-top:2px">` +
  `<span style="display:inline-block;width:12px;height:2px;border-radius:1px;background:${color}"></span>` +
  `<b style="color:${INK.primary}">${value}</b>` +
  `<span style="color:${INK.secondary}">${escapeHtml(name)}</span></div>`

export const tooltipTitle = (title: string) =>
  `<div style="color:${INK.secondary};font-size:11px;margin-bottom:2px">${escapeHtml(title)}</div>`

// Los nombres de proyectos/clientes vienen de la base: se escapan antes de ir a HTML
export const escapeHtml = (s: string) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
