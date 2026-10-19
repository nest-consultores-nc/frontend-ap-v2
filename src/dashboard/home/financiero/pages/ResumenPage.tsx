import { useMemo } from 'react'
import { applyFilters, divide, groupSum, onCalendar, periodRange, ratios } from '../model'
import { periodColumns, periodLine } from '../charts'
import { ChartCard, EmptyChart } from '../ChartCard'
import { EChart } from '../EChart'
import { StatTile } from '../StatTile'
import { PBI, fmt, periodLabel } from '../theme'
import { CHART_H, PageProps, selectedSet } from './shared'

export function ResumenPage({ model, filters, select }: PageProps) {
  const totals = useMemo(() => ratios(applyFilters(model.utilidad, filters)), [model, filters])

  const evo = useMemo(() => {
    const rows = onCalendar(applyFilters(model.utilidad, filters, 'period'))
    const g = groupSum(rows, (r) => r.period, ['ing', 'cost', 'util'])
    const periods = periodRange([...g.keys()])
    const at = (p: string, f: string) => g.get(p)?.[f] ?? 0
    return {
      periods,
      ing: periods.map((p) => at(p, 'ing')),
      cost: periods.map((p) => at(p, 'cost')),
      margen: periods.map((p) => (g.has(p) ? divide(at(p, 'util'), at(p, 'ing')) : null)),
    }
  }, [model, filters])

  const onPeriod = (i: number, multi: boolean) =>
    evo.periods[i] && select('period', evo.periods[i], multi)

  const columnsOption = useMemo(
    () =>
      periodColumns(
        evo.periods,
        [
          { name: 'Ingreso', color: PBI.comboIngreso, borderColor: PBI.comboIngresoBorde, values: evo.ing },
          { name: 'Costo', color: PBI.comboCosto, values: evo.cost },
        ],
        selectedSet(filters, 'period')
      ),
    [evo, filters]
  )

  const marginOption = useMemo(
    () =>
      periodLine(
        evo.periods,
        [{ name: 'Margen de utilidad', color: PBI.margen, values: evo.margen as number[] }],
        selectedSet(filters, 'period'),
        (v) => fmt.pct(v),
        (v) => fmt.pct(v)
      ),
    [evo, filters]
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 content-start">
        <StatTile label="Utilidad" value={fmt.clp(totals.util)} color={PBI.utilidad} hero />
        <div className="grid grid-cols-2 gap-4">
          <StatTile label="Ingreso" value={fmt.clpShort(totals.ing)} hint={fmt.clp(totals.ing)} color={PBI.ingreso} />
          <StatTile label="Costo" value={fmt.clpShort(totals.cost)} hint={fmt.clp(totals.cost)} />
        </div>
        <div className="grid grid-cols-3 gap-4 sm:col-span-2 lg:col-span-1">
          <StatTile label="Margen" value={fmt.pct(totals.margen)} hint="Utilidad / Ingreso" />
          <StatTile label="Productividad" value={fmt.pct(totals.productividad)} hint="Utilidad / Costo" color={PBI.productividad} />
          <StatTile label="Eficiencia" value={fmt.pct(totals.eficiencia)} hint="Costo / Ingreso" />
        </div>
      </div>

      <div className="lg:col-span-8 grid grid-cols-1 gap-4">
        <ChartCard
          title="Evolución Ingresos y Costos"
          subtitle="Haz clic en un mes para filtrar el resto del dashboard"
          legend={[
            { label: 'Ingreso', color: PBI.comboIngreso },
            { label: 'Costo', color: PBI.comboCosto },
          ]}
          table={{
            columns: ['Mes', 'Ingreso', 'Costo', 'Margen'],
            numeric: [1, 2, 3],
            rows: evo.periods.map((p, i) => [
              periodLabel(p),
              fmt.clp(evo.ing[i]),
              fmt.clp(evo.cost[i]),
              fmt.pct(evo.margen[i]),
            ]),
          }}
        >
          {evo.periods.length ? (
            <EChart option={columnsOption} height={CHART_H} onAxisClick={onPeriod} ariaLabel="Ingresos y costos por mes" />
          ) : (
            <EmptyChart height={CHART_H} />
          )}
        </ChartCard>

        <ChartCard title="Margen de utilidad mensual" subtitle="Utilidad / Ingreso de cada mes">
          {evo.periods.length ? (
            <EChart option={marginOption} height={180} onAxisClick={onPeriod} ariaLabel="Margen de utilidad por mes" />
          ) : (
            <EmptyChart height={180} />
          )}
        </ChartCard>
      </div>
    </div>
  )
}
