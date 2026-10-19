// Constructores de opciones ECharts con un estilo común:
// marcas delgadas, grilla tenue, tooltip con todas las series y
// resaltado de la selección (lo no seleccionado queda atenuado).
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { EChartsCoreOption } from 'echarts/core'
import {
  INK,
  WATERFALL,
  axisStyle,
  fmt,
  inkOn,
  periodLabel,
  tooltipRow,
  tooltipStyle,
  tooltipTitle,
} from './theme'

export interface Series {
  name: string
  color: string
  values: number[]
  /** color por barra (degradados de Power BI); alineado con values */
  itemColors?: string[]
  /** borde de las barras (la columna de Ingreso del Resumen lo tiene) */
  borderColor?: string
}

/** Un color para todo o uno por elemento */
type ColorSpec = string | string[]
const colorAt = (c: ColorSpec, i: number) => (Array.isArray(c) ? c[i] : c)

export interface Cat {
  key: string
  label: string
}

const DIM_OPACITY = 0.3
const BAR_MAX = 24

const opacityFor = (key: string, selected: Set<string>) =>
  selected.size === 0 || selected.has(key) ? 1 : DIM_OPACITY

/** Radio de 4px solo en el extremo con datos; recto en la línea base */
const radius = (value: number, horizontal: boolean) => {
  if (horizontal) return value < 0 ? [4, 0, 0, 4] : [0, 4, 4, 0]
  return value < 0 ? [0, 0, 4, 4] : [4, 4, 0, 0]
}

const valueAxis = (format: (v: number) => string) => ({
  type: 'value',
  ...axisStyle,
  axisLine: { show: false },
  axisLabel: { ...axisStyle.axisLabel, formatter: format, hideOverlap: true },
})

const categoryAxis = (keys: string[], label: (k: string) => string) => ({
  type: 'category',
  data: keys,
  ...axisStyle,
  splitLine: { show: false },
  axisLabel: {
    ...axisStyle.axisLabel,
    formatter: label,
    hideOverlap: true,
  },
})

/** Columnas agrupadas por mes (una o varias series) */
export const periodColumns = (
  periods: string[],
  series: Series[],
  selected: Set<string>,
  format = fmt.clp,
  axisFormat = fmt.clpShort,
  integer = false,
  /** columnas apiladas (una serie encima de otra) */
  stacked = false
): EChartsCoreOption => ({
  animationDuration: 300,
  grid: { left: 8, right: 8, top: 12, bottom: 4, containLabel: true },
  tooltip: {
    ...tooltipStyle,
    trigger: 'axis',
    axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,0,0,0.04)' } },
    formatter: (ps: any[]) =>
      tooltipTitle(periodLabel(ps[0].name)) +
      ps
        .filter((p) => !stacked || Number(p.value) > 0)
        .map((p) => tooltipRow(p.color, p.seriesName, format(p.value)))
        .join(''),
  },
  xAxis: categoryAxis(periods, periodLabel),
  yAxis: { ...valueAxis(axisFormat), minInterval: integer ? 1 : 0 },
  series: series.map((s, si) => ({
    name: s.name,
    type: 'bar',
    stack: stacked ? 'total' : undefined,
    barMaxWidth: stacked ? 36 : BAR_MAX,
    barGap: '10%',
    color: s.color,
    data: s.values.map((v, i) => ({
      value: v,
      itemStyle: {
        color: s.itemColors?.[i] ?? s.color,
        borderRadius: !stacked || si === series.length - 1 ? radius(v, false) : 0,
        opacity: opacityFor(periods[i], selected),
        borderColor: stacked ? INK.surface : s.borderColor,
        borderWidth: stacked || s.borderColor ? 1 : 0,
      },
    })),
  })),
})

/** Línea por mes (2px, marcador al final) */
export const periodLine = (
  periods: string[],
  series: Series[],
  selected: Set<string>,
  format: (v: number) => string,
  axisFormat: (v: number) => string,
  area = false
): EChartsCoreOption => ({
  animationDuration: 300,
  grid: { left: 8, right: 16, top: 12, bottom: 4, containLabel: true },
  tooltip: {
    ...tooltipStyle,
    trigger: 'axis',
    axisPointer: { type: 'line', lineStyle: { color: INK.axis } },
    formatter: (ps: any[]) =>
      tooltipTitle(periodLabel(ps[0].name)) +
      ps
        .filter((p) => p.value !== null && p.value !== undefined)
        .map((p) => tooltipRow(p.color, p.seriesName, format(p.value)))
        .join(''),
  },
  xAxis: { ...categoryAxis(periods, periodLabel), boundaryGap: false },
  yAxis: valueAxis(axisFormat),
  series: series.map((s) => ({
    name: s.name,
    type: 'line',
    color: s.color,
    stack: area ? 'total' : undefined,
    smooth: false,
    connectNulls: false,
    lineStyle: { width: 2, cap: 'round', join: 'round' },
    areaStyle: area ? { opacity: 0.45 } : undefined,
    symbol: 'circle',
    symbolSize: (_: number, p: any) =>
      selected.has(periods[p.dataIndex]) || p.dataIndex === s.values.length - 1 ? 8 : 0,
    showSymbol: true,
    itemStyle: { borderColor: INK.surface, borderWidth: 2 },
    emphasis: { focus: 'none', scale: 1.4 },
    data: s.values,
    markLine:
      selected.size > 0
        ? {
            silent: true,
            symbol: 'none',
            label: { show: false },
            lineStyle: { color: INK.secondary, width: 1, type: 'solid' },
            data: periods.filter((p) => selected.has(p)).map((p) => ({ xAxis: p })),
          }
        : undefined,
  })),
})

/** Barras horizontales (una serie o apiladas), ordenadas de mayor a menor */
export const horizontalBars = (
  cats: Cat[],
  series: Series[],
  selected: Set<string>,
  format: (v: number) => string,
  axisFormat: (v: number) => string,
  extraTooltip?: (index: number) => string
): EChartsCoreOption => {
  const stacked = series.length > 1
  const labels = new Map(cats.map((c) => [c.key, c.label]))
  const keys = cats.map((c) => c.key)
  const VISIBLE = 12
  return {
    animationDuration: 300,
    grid: { left: 8, right: 24, top: 4, bottom: 4, containLabel: true },
    tooltip: {
      ...tooltipStyle,
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,0,0,0.04)' } },
      formatter: (ps: any[]) =>
        tooltipTitle(labels.get(ps[0].name) ?? ps[0].name) +
        ps.map((p) => tooltipRow(p.color, p.seriesName, format(p.value))).join('') +
        (extraTooltip ? extraTooltip(ps[0].dataIndex) : ''),
    },
    // Con muchas categorías se muestra una ventana desplazable (rueda del mouse)
    dataZoom:
      cats.length > VISIBLE
        ? [
            {
              type: 'inside',
              yAxisIndex: 0,
              startValue: cats.length - VISIBLE,
              endValue: cats.length - 1,
              zoomLock: true,
              moveOnMouseWheel: true,
              zoomOnMouseWheel: false,
            },
            {
              type: 'slider',
              yAxisIndex: 0,
              width: 8,
              right: 4,
              showDetail: false,
              brushSelect: false,
              borderColor: 'transparent',
              fillerColor: 'rgba(0,0,0,0.12)',
              handleSize: 0,
              backgroundColor: 'rgba(0,0,0,0.03)',
              dataBackground: { lineStyle: { opacity: 0 }, areaStyle: { opacity: 0 } },
            },
          ]
        : undefined,
    xAxis: { ...valueAxis(axisFormat), splitNumber: 3 },
    // Orden invertido: la categoría mayor queda arriba
    yAxis: {
      ...categoryAxis([...keys].reverse(), (k) => truncate(labels.get(k) ?? k, 28)),
      axisLabel: { ...axisStyle.axisLabel, formatter: (k: string) => truncate(labels.get(k) ?? k, 28) },
    },
    series: series.map((s, si) => ({
      name: s.name,
      type: 'bar',
      stack: stacked ? 'total' : undefined,
      barMaxWidth: 18,
      color: s.color,
      data: [...s.values].reverse().map((v, ri) => {
        const i = keys.length - 1 - ri
        const key = keys[i]
        const last = !stacked || si === series.length - 1
        return {
          value: v,
          itemStyle: {
            color: s.itemColors?.[i] ?? s.color,
            borderRadius: last ? radius(v, true) : 0,
            opacity: opacityFor(key, selected),
            borderColor: stacked ? INK.surface : undefined,
            borderWidth: stacked ? 1 : 0,
          },
        }
      }),
    })),
  }
}

/** Columnas verticales por categoría (p. ej. utilidad por cliente) */
export const categoryColumns = (
  cats: Cat[],
  values: number[],
  color: ColorSpec,
  selected: Set<string>,
  name: string,
  format: (v: number) => string,
  axisFormat: (v: number) => string
): EChartsCoreOption => {
  const labels = new Map(cats.map((c) => [c.key, c.label]))
  return {
    animationDuration: 300,
    grid: { left: 8, right: 8, top: 12, bottom: 4, containLabel: true },
    tooltip: {
      ...tooltipStyle,
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,0,0,0.04)' } },
      formatter: (ps: any[]) =>
        tooltipTitle(labels.get(ps[0].name) ?? ps[0].name) +
        tooltipRow(ps[0].color, name, format(ps[0].value)),
    },
    dataZoom:
      cats.length > 16
        ? [{ type: 'inside', xAxisIndex: 0, startValue: 0, endValue: 15, zoomLock: true, moveOnMouseWheel: true, zoomOnMouseWheel: false }]
        : undefined,
    xAxis: {
      ...categoryAxis(cats.map((c) => c.key), (k) => truncate(labels.get(k) ?? k, 14)),
      axisLabel: {
        ...axisStyle.axisLabel,
        formatter: (k: string) => truncate(labels.get(k) ?? k, 14),
        rotate: cats.length > 6 ? 35 : 0,
        interval: 0,
      },
    },
    yAxis: valueAxis(axisFormat),
    series: [
      {
        name,
        type: 'bar',
        barMaxWidth: BAR_MAX,
        data: values.map((v, i) => ({
          value: v,
          itemStyle: {
            color: colorAt(color, i),
            borderRadius: radius(v, false),
            opacity: opacityFor(cats[i].key, selected),
          },
        })),
      },
    ],
  }
}

/** Torta: parte de un todo, máximo ~6 segmentos */
export const pie = (
  items: { key: string; label: string; value: number; color: string }[],
  selected: Set<string>,
  format: (v: number) => string
): EChartsCoreOption => {
  const total = items.reduce((s, i) => s + i.value, 0)
  return {
    animationDuration: 300,
    tooltip: {
      ...tooltipStyle,
      trigger: 'item',
      formatter: (p: any) =>
        tooltipRow(p.color, p.name, format(p.value)) +
        `<div style="color:${INK.secondary};font-size:11px;margin-left:20px">${fmt.pct(total ? p.value / total : null)} del total</div>`,
    },
    series: [
      {
        type: 'pie',
        radius: [0, '80%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        itemStyle: { borderColor: INK.surface, borderWidth: 2, borderRadius: 3 },
        emphasis: { scale: true, scaleSize: 4 },
        data: items.map((i) => ({
          key: i.key,
          name: i.label,
          value: i.value,
          itemStyle: { color: i.color, opacity: opacityFor(i.key, selected) },
        })),
      },
    ],
  }
}

/** Treemap; el color puede ser uno solo o uno por elemento (degradado) */
export const treemap = (
  items: { key: string; label: string; value: number }[],
  color: ColorSpec,
  selected: Set<string>,
  format: (v: number) => string,
  /** formato del texto dentro de cada rectángulo */
  labelFormat: (v: number) => string = fmt.clpShort
): EChartsCoreOption => {
  const total = items.reduce((s, i) => s + i.value, 0)
  return {
    animationDuration: 300,
    tooltip: {
      ...tooltipStyle,
      trigger: 'item',
      formatter: (p: any) =>
        tooltipRow(p.color, p.name, format(p.value)) +
        `<div style="color:${INK.secondary};font-size:11px;margin-left:20px">${fmt.pct(total ? p.value / total : null)} del total</div>`,
    },
    series: [
      {
        type: 'treemap',
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        itemStyle: { borderColor: INK.surface, borderWidth: 2, gapWidth: 2, borderRadius: 4 },
        label: {
          show: true,
          color: '#ffffff',
          fontSize: 12,
          overflow: 'truncate',
          formatter: (p: any) => `${p.name}\n${labelFormat(p.value)}`,
        },
        upperLabel: { show: false },
        data: items.map((it, i) => ({
          key: it.key,
          name: it.label,
          value: it.value,
          itemStyle: { color: colorAt(color, i), opacity: opacityFor(it.key, selected) },
          // texto blanco o negro según el fondo (los verdes claros necesitan texto oscuro)
          label: { color: inkOn(colorAt(color, i)) },
        })),
      },
    ],
  }
}

/** Cascada mensual: cada mes suma o resta a la utilidad acumulada; al final el total */
export const waterfall = (
  periods: string[],
  values: number[],
  selected: Set<string>
): EChartsCoreOption => {
  const TOTAL = '__total__'
  const keys = [...periods, TOTAL]
  const base: number[] = []
  const delta: any[] = []
  let acc = 0
  values.forEach((v, i) => {
    const from = acc
    acc += v
    base.push(Math.min(from, acc))
    delta.push({
      value: Math.abs(v),
      real: v,
      itemStyle: {
        color: v >= 0 ? WATERFALL.up : WATERFALL.down,
        borderRadius: 2,
        opacity: opacityFor(periods[i], selected),
      },
    })
  })
  base.push(Math.min(0, acc))
  delta.push({
    value: Math.abs(acc),
    real: acc,
    total: true,
    itemStyle: { color: WATERFALL.total, borderRadius: radius(acc, false) },
  })

  const label = (k: string) => (k === TOTAL ? 'Total' : periodLabel(k))
  return {
    animationDuration: 300,
    grid: { left: 8, right: 8, top: 12, bottom: 4, containLabel: true },
    tooltip: {
      ...tooltipStyle,
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,0,0,0.04)' } },
      formatter: (ps: any[]) => {
        const p = ps.find((x) => x.seriesName === 'delta')
        if (!p) return ''
        const d = p.data
        const color = d.total ? WATERFALL.total : d.real >= 0 ? WATERFALL.up : WATERFALL.down
        return (
          tooltipTitle(label(p.name)) +
          tooltipRow(color, d.total ? 'Utilidad total' : 'Utilidad del mes', fmt.clp(d.real))
        )
      },
    },
    xAxis: categoryAxis(keys, label),
    yAxis: valueAxis(fmt.clpShort),
    series: [
      {
        name: 'base',
        type: 'bar',
        stack: 'wf',
        silent: true,
        itemStyle: { color: 'transparent' },
        emphasis: { disabled: true },
        data: base,
        barMaxWidth: BAR_MAX,
      },
      { name: 'delta', type: 'bar', stack: 'wf', data: delta, barMaxWidth: BAR_MAX },
    ],
  }
}

/** Dispersión costo vs ingreso por cliente; un color por cliente, como en Power BI */
export const scatter = (
  points: { key: string; label: string; x: number; y: number }[],
  color: ColorSpec,
  selected: Set<string>
): EChartsCoreOption => ({
  animationDuration: 300,
  grid: { left: 8, right: 24, top: 16, bottom: 28, containLabel: true },
  tooltip: {
    ...tooltipStyle,
    trigger: 'item',
    formatter: (p: any) =>
      tooltipTitle(p.data.label) +
      tooltipRow(p.color, 'Ingreso', fmt.clp(p.data.value[1])) +
      tooltipRow(p.color, 'Costo', fmt.clp(p.data.value[0])),
  },
  xAxis: {
    ...valueAxis(fmt.clpShort),
    name: 'Costo',
    nameLocation: 'middle',
    nameGap: 24,
    nameTextStyle: { color: INK.secondary, fontSize: 11 },
  },
  yAxis: {
    ...valueAxis(fmt.clpShort),
    name: 'Ingreso',
    nameTextStyle: { color: INK.secondary, fontSize: 11, align: 'left' },
  },
  series: [
    {
      type: 'scatter',
      symbolSize: 12,
      itemStyle: { borderColor: INK.surface, borderWidth: 2 },
      emphasis: { scale: 1.5 },
      data: points.map((p, i) => ({
        key: p.key,
        label: p.label,
        value: [p.x, p.y],
        itemStyle: { color: colorAt(color, i), opacity: opacityFor(p.key, selected) },
      })),
    },
    {
      // Línea de equilibrio: sobre ella el cliente deja utilidad
      type: 'line',
      silent: true,
      symbol: 'none',
      tooltip: { show: false },
      lineStyle: { color: INK.axis, width: 1, type: 'solid' },
      endLabel: { show: true, formatter: 'Ingreso = Costo', color: INK.muted, fontSize: 10 },
      data: (() => {
        const m = Math.max(0, ...points.map((p) => Math.min(p.x, p.y)))
        return [[0, 0], [m, m]]
      })(),
    },
  ],
})

export const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
