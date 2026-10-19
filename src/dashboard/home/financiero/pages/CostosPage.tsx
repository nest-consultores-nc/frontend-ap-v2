import { useMemo } from 'react'
import { applyFilters, clientName, groupSum, onCalendar, periodRange, projectName, sumOf } from '../model'
import { pie, horizontalBars, periodLine } from '../charts'
import { ChartCard, EmptyChart } from '../ChartCard'
import { EChart } from '../EChart'
import { INK, PBI, fmt, periodLabel, tooltipRow } from '../theme'
import { COST_CLASSES, CHART_H, PageProps, selectedSet } from './shared'

const FIELDS = ['dir', 'ind', 'sal', 'tot'] as const

// Página "Costos": usa projects_costs, convertido a pesos con la UF del día
export function CostosPage({ model, filters, select }: PageProps) {
  const byDim = (dim: 'project' | 'client') => {
    const g = groupSum(applyFilters(model.costs, filters, dim), (r) => r[dim], [...FIELDS])
    return [...g]
      .map(([id, v]) => ({ id, dir: v.dir, ind: v.ind, sal: v.sal, tot: v.tot }))
      .sort((a, b) => b.tot - a.tot)
  }

  const byProject = useMemo(() => byDim('project'), [model, filters]) // eslint-disable-line react-hooks/exhaustive-deps
  const byClient = useMemo(() => byDim('client'), [model, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  const monthly = useMemo(() => {
    const rows = onCalendar(applyFilters(model.costs, filters, 'period'))
    const g = groupSum(rows, (r) => r.period, [...FIELDS])
    const periods = periodRange([...g.keys()])
    const at = (p: string, f: string) => g.get(p)?.[f] ?? 0
    return { periods, at }
  }, [model, filters])

  const composition = useMemo(() => {
    const rows = applyFilters(model.costs, filters)
    return COST_CLASSES.map((c) => ({ ...c, value: sumOf(rows, c.field) }))
  }, [model, filters])

  const stackedOption = (
    rows: typeof byProject,
    label: (id: number) => string,
    dim: 'project' | 'client'
  ) =>
    horizontalBars(
      rows.map((r) => ({ key: String(r.id), label: label(r.id) })),
      COST_CLASSES.map((c) => ({ name: c.name, color: c.color, values: rows.map((r) => r[c.field]) })),
      selectedSet(filters, dim),
      fmt.clp,
      fmt.clpShort,
      // Tooltip extra: costo total (como en el reporte original)
      (i) => tooltipRow(INK.secondary, 'Costo total', fmt.clp(rows[rows.length - 1 - i]?.tot ?? 0))
    )

  const options = useMemo(
    () => ({
      project: stackedOption(byProject, (id) => projectName(model, id), 'project'),
      client: stackedOption(byClient, (id) => clientName(model, id), 'client'),
      area: periodLine(
        monthly.periods,
        COST_CLASSES.map((c) => ({
          name: c.name,
          // En el área Power BI usa un coral más claro para el costo indirecto
          color: c.field === 'ind' ? PBI.indirectoClaro : c.color,
          values: monthly.periods.map((p) => monthly.at(p, c.field)),
        })),
        selectedSet(filters, 'period'),
        fmt.clp,
        fmt.clpShort,
        true
      ),
      // Tendencia mensual del reporte original: Sum(projects_costs[project_cost]) por mes
      trend: periodLine(
        monthly.periods,
        [{ name: 'Costo total', color: PBI.indirectoClaro, values: monthly.periods.map((p) => monthly.at(p, 'tot')) }],
        selectedSet(filters, 'period'),
        fmt.clp,
        fmt.clpShort
      ),
      composition: pie(
        composition
          .filter((c) => c.value > 0)
          .map((c) => ({ key: c.field, label: c.name, value: c.value, color: c.color })),
        new Set(),
        fmt.clp
      ),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, filters, byProject, byClient, monthly, composition]
  )

  const stackedTable = (rows: typeof byProject, first: string, label: (id: number) => string) => ({
    columns: [first, 'Directo', 'Indirecto', 'Salarial', 'Total'],
    numeric: [1, 2, 3, 4],
    rows: rows.map((r) => [label(r.id), fmt.clp(r.dir), fmt.clp(r.ind), fmt.clp(r.sal), fmt.clp(r.tot)]),
  })

  const costLegend = COST_CLASSES.map((c) => ({ label: c.name, color: c.color }))
  const total = composition.reduce((s, c) => s + c.value, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
        <ChartCard
          title="Costos por proyecto"
          legend={costLegend}
          table={stackedTable(byProject, 'Proyecto', (id) => projectName(model, id))}
        >
          {byProject.length ? (
            <EChart
              option={options.project}
              height={CHART_H}
              categoryAxis="y"
              onAxisClick={(i, multi) => {
                const r = byProject[byProject.length - 1 - i]
                if (r) select('project', r.id, multi)
              }}
              ariaLabel="Costos por proyecto"
            />
          ) : (
            <EmptyChart height={CHART_H} />
          )}
        </ChartCard>

        <ChartCard
          title="Costos por cliente"
          legend={costLegend}
          table={stackedTable(byClient, 'Cliente', (id) => clientName(model, id))}
        >
          {byClient.length ? (
            <EChart
              option={options.client}
              height={CHART_H}
              categoryAxis="y"
              onAxisClick={(i, multi) => {
                const r = byClient[byClient.length - 1 - i]
                if (r) select('client', r.id, multi)
              }}
              ariaLabel="Costos por cliente"
            />
          ) : (
            <EmptyChart height={CHART_H} />
          )}
        </ChartCard>

        <ChartCard
          title="Tendencia mensual"
          subtitle="Costo total por mes"
          table={{
            columns: ['Mes', 'Costo total'],
            numeric: [1],
            rows: monthly.periods.map((p) => [periodLabel(p), fmt.clp(monthly.at(p, 'tot'))]),
          }}
        >
          {monthly.periods.length ? (
            <EChart
              option={options.trend}
              height={220}
              onAxisClick={(i, multi) => monthly.periods[i] && select('period', monthly.periods[i], multi)}
              ariaLabel="Tendencia mensual del costo total"
            />
          ) : (
            <EmptyChart height={220} />
          )}
        </ChartCard>

        <ChartCard
          title="Composición del costo total"
          subtitle={`Total: ${fmt.clp(total)}`}
          legend={costLegend}
          table={{
            columns: ['Clase', 'Monto', '% del total'],
            numeric: [1, 2],
            rows: composition.map((c) => [c.name, fmt.clp(c.value), fmt.pct(total ? c.value / total : null)]),
          }}
        >
          {total > 0 ? (
            <EChart option={options.composition} height={220} ariaLabel="Composición del costo total" />
          ) : (
            <EmptyChart height={220} />
          )}
        </ChartCard>
      </div>

      <ChartCard
        className="lg:col-span-6"
        title="Evolución de costos por clase"
        subtitle="Directo, indirecto y salarial apilados"
        legend={COST_CLASSES.map((c) => ({ label: c.name, color: c.field === 'ind' ? PBI.indirectoClaro : c.color }))}
        table={{
          columns: ['Mes', 'Directo', 'Indirecto', 'Salarial', 'Total'],
          numeric: [1, 2, 3, 4],
          rows: monthly.periods.map((p) => [
            periodLabel(p),
            fmt.clp(monthly.at(p, 'dir')),
            fmt.clp(monthly.at(p, 'ind')),
            fmt.clp(monthly.at(p, 'sal')),
            fmt.clp(monthly.at(p, 'tot')),
          ]),
        }}
      >
        {monthly.periods.length ? (
          <EChart
            option={options.area}
            height={CHART_H * 2 + 40}
            onAxisClick={(i, multi) => monthly.periods[i] && select('period', monthly.periods[i], multi)}
            ariaLabel="Evolución de costos por clase"
          />
        ) : (
          <EmptyChart height={CHART_H * 2 + 40} />
        )}
      </ChartCard>
    </div>
  )
}
