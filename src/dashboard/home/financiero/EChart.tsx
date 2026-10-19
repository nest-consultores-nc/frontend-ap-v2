import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, ScatterChart, TreemapChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption, ECElementEvent } from 'echarts/core'

// Solo se registran los módulos que se usan, para no cargar ECharts completo
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  TreemapChart,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
  CanvasRenderer,
])

/** multi = el usuario mantuvo Ctrl/Cmd para sumar a la selección */
export type ItemClick = (e: ECElementEvent, multi: boolean) => void
export type AxisClick = (index: number, multi: boolean) => void

interface Props {
  option: EChartsCoreOption
  height: number
  ariaLabel: string
  /** clic sobre una marca (torta, treemap, dispersión) */
  onItemClick?: ItemClick
  /** clic en cualquier punto de la grilla: entrega el índice de la categoría */
  onAxisClick?: AxisClick
  /** eje de categorías: 'x' (columnas, líneas) o 'y' (barras horizontales) */
  categoryAxis?: 'x' | 'y'
}

const isMulti = (ev?: { ctrlKey?: boolean; metaKey?: boolean }) => !!(ev?.ctrlKey || ev?.metaKey)

export function EChart({ option, height, ariaLabel, onItemClick, onAxisClick, categoryAxis = 'x' }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const chart = useRef<echarts.ECharts | null>(null)
  const handlers = useRef({ onItemClick, onAxisClick, categoryAxis })
  handlers.current = { onItemClick, onAxisClick, categoryAxis }

  useEffect(() => {
    if (!el.current) return
    const instance = echarts.init(el.current, undefined, { renderer: 'canvas' })
    chart.current = instance

    instance.on('click', (e) => {
      const native = (e as ECElementEvent).event?.event as MouseEvent | undefined
      handlers.current.onItemClick?.(e as ECElementEvent, isMulti(native))
    })

    instance.getZr().on('click', (ev) => {
      const { onAxisClick: cb, categoryAxis: axis } = handlers.current
      if (!cb) return
      const point = [ev.offsetX, ev.offsetY]
      if (!instance.containPixel('grid', point)) return
      const [x, y] = instance.convertFromPixel({ gridIndex: 0 }, point) as number[]
      const index = Math.round(axis === 'x' ? x : y)
      if (Number.isFinite(index)) cb(index, isMulti(ev.event as unknown as MouseEvent))
    })

    const ro = new ResizeObserver(() => instance.resize())
    ro.observe(el.current)
    return () => {
      ro.disconnect()
      // Cierra el tooltip pendiente antes de destruir el gráfico; si no, ECharts
      // intenta dibujarlo sobre un nodo que ya no existe (al cambiar de pestaña)
      instance.dispatchAction({ type: 'hideTip' })
      instance.dispose()
      chart.current = null
    }
  }, [])

  useEffect(() => {
    const instance = chart.current
    if (!instance) return
    // Cierra el tooltip y el resaltado antes de cambiar los datos: si el mouse está
    // sobre una barra que deja de existir (p. ej. al profundizar), ECharts falla
    instance.dispatchAction({ type: 'hideTip' })
    instance.dispatchAction({ type: 'downplay' })
    instance.setOption(option, { notMerge: true })
  }, [option])

  const clickable = !!(onItemClick || onAxisClick)
  return (
    <div
      ref={el}
      style={{ height, cursor: clickable ? 'pointer' : undefined }}
      className="w-full"
      role="img"
      aria-label={ariaLabel}
    />
  )
}
