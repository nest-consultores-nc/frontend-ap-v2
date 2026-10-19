import { useMemo } from 'react'
import { applyFilters, clientName, groupSum, onCalendar, periodRange, typeName } from '../model'
import { pie, horizontalBars, periodColumns, periodLine, treemap } from '../charts'
import { ChartCard, EmptyChart } from '../ChartCard'
import { EChart } from '../EChart'
import { PBI, fmt, gradient, periodLabel } from '../theme'
import { CHART_H, PageProps, selectedSet, typeColorIngreso } from './shared'

// Página "Ingresos": usa la tabla income (montos en pesos)
export function IngresosPage({ model, filters, select }: PageProps) {
  const monthly = useMemo(() => {
    const rows = onCalendar(applyFilters(model.income, filters, 'period'))
    const g = groupSum(rows, (r) => r.period, ['amt'])
    const periods = periodRange([...g.keys()])
    return { periods, amt: periods.map((p) => g.get(p)?.amt ?? 0) }
  }, [model, filters])

  const byProject = useMemo(() => {
    const g = groupSum(applyFilters(model.income, filters, 'project'), (r) => r.project, ['amt'])
    return [...g]
      .map(([id, v]) => {
        const p = model.projects.get(id)
        // Columna calculada "Cliente-Proyecto" del reporte original
        const label = p ? `${p.client ?? 'Sin cliente'} - ${p.name}` : `Proyecto ${id}`
        return { id, label, amt: v.amt }
      })
      .sort((a, b) => b.amt - a.amt)
  }, [model, filters])

  const byType = useMemo(() => {
    const g = groupSum(applyFilters(model.income, filters, 'type'), (r) => r.type, ['amt'])
    return [...g].map(([id, v]) => ({ id, amt: v.amt })).sort((a, b) => b.amt - a.amt)
  }, [model, filters])

  const byClient = useMemo(() => {
    const g = groupSum(applyFilters(model.income, filters, 'client'), (r) => r.client, ['amt'])
    return [...g].map(([id, v]) => ({ id, amt: v.amt })).sort((a, b) => b.amt - a.amt)
  }, [model, filters])

  const onPeriod = (i: number, multi: boolean) =>
    monthly.periods[i] && select('period', monthly.periods[i], multi)

  const options = useMemo(() => {
    const selPeriod = selectedSet(filters, 'period')
    const clientes = byClient.filter((c) => c.amt > 0)
    const colorCliente = gradient(PBI.ingresosCliente, clientes.map((c) => c.amt))
    const colorProyecto = gradient(PBI.ingresosProyecto, byProject.map((p) => p.amt))
    return {
      columns: periodColumns(
        monthly.periods,
        [{ name: 'Ingresos', color: PBI.evolucionIngresos, values: monthly.amt }],
        selPeriod
      ),
      line: periodLine(
        monthly.periods,
        [{ name: 'Ingresos', color: PBI.tendenciaIngresos, values: monthly.amt }],
        selPeriod,
        fmt.clp,
        fmt.clpShort
      ),
      project: horizontalBars(
        byProject.map((p) => ({ key: String(p.id), label: p.label })),
        [
          {
            name: 'Ingresos',
            color: PBI.ingresosProyecto[1],
            values: byProject.map((p) => p.amt),
            itemColors: byProject.map((p) => colorProyecto(p.amt)),
          },
        ],
        selectedSet(filters, 'project'),
        fmt.clp,
        fmt.clpShort
      ),
      type: pie(
        byType
          .filter((t) => t.amt > 0)
          .map((t) => ({
            key: String(t.id),
            label: typeName(model, t.id),
            value: t.amt,
            color: typeColorIngreso(model, t.id),
          })),
        selectedSet(filters, 'type'),
        fmt.clp
      ),
      client: treemap(
        clientes.map((c) => ({ key: String(c.id), label: clientName(model, c.id), value: c.amt })),
        clientes.map((c) => colorCliente(c.amt)),
        selectedSet(filters, 'client'),
        fmt.clp
      ),
    }
  }, [model, filters, monthly, byProject, byType, byClient])

  const monthlyTable = {
    columns: ['Mes', 'Ingresos'],
    numeric: [1],
    rows: monthly.periods.map((p, i) => [periodLabel(p), fmt.clp(monthly.amt[i])]),
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <ChartCard className="lg:col-span-6" title="Evolución de ingresos" subtitle="Por año y mes" table={monthlyTable}>
        {monthly.periods.length ? (
          <EChart option={options.columns} height={CHART_H} onAxisClick={onPeriod} ariaLabel="Ingresos por mes" />
        ) : (
          <EmptyChart height={CHART_H} />
        )}
      </ChartCard>

      <ChartCard
        className="lg:col-span-6"
        title="Ingresos por proyecto"
        subtitle={byProject.length > 12 ? 'Usa la rueda del mouse para ver más proyectos' : undefined}
        table={{
          columns: ['Cliente - Proyecto', 'Ingresos'],
          numeric: [1],
          rows: byProject.map((p) => [p.label, fmt.clp(p.amt)]),
        }}
      >
        {byProject.length ? (
          <EChart
            option={options.project}
            height={CHART_H}
            categoryAxis="y"
            onAxisClick={(i, multi) => {
              const p = byProject[byProject.length - 1 - i]
              if (p) select('project', p.id, multi)
            }}
            ariaLabel="Ingresos por proyecto"
          />
        ) : (
          <EmptyChart height={CHART_H} />
        )}
      </ChartCard>

      <ChartCard className="lg:col-span-4" title="Tendencia mensual" table={monthlyTable}>
        {monthly.periods.length ? (
          <EChart option={options.line} height={CHART_H - 40} onAxisClick={onPeriod} ariaLabel="Tendencia mensual de ingresos" />
        ) : (
          <EmptyChart height={CHART_H - 40} />
        )}
      </ChartCard>

      <ChartCard
        className="lg:col-span-3"
        title="Ingreso por tipo de proyecto"
        legend={byType.filter((t) => t.amt > 0).map((t) => ({ label: typeName(model, t.id), color: typeColorIngreso(model, t.id) }))}
        table={{
          columns: ['Tipo', 'Ingresos'],
          numeric: [1],
          rows: byType.map((t) => [typeName(model, t.id), fmt.clp(t.amt)]),
        }}
      >
        {byType.some((t) => t.amt > 0) ? (
          <EChart
            option={options.type}
            height={CHART_H - 40}
            onItemClick={(e, multi) => select('type', Number((e.data as { key: string }).key), multi)}
            ariaLabel="Ingresos por tipo de proyecto"
          />
        ) : (
          <EmptyChart height={CHART_H - 40} />
        )}
      </ChartCard>

      <ChartCard
        className="lg:col-span-5"
        title="Ingresos por cliente"
        table={{
          columns: ['Cliente', 'Ingresos'],
          numeric: [1],
          rows: byClient.map((c) => [clientName(model, c.id), fmt.clp(c.amt)]),
        }}
      >
        {byClient.some((c) => c.amt > 0) ? (
          <EChart
            option={options.client}
            height={CHART_H - 40}
            onItemClick={(e, multi) => select('client', Number((e.data as { key: string }).key), multi)}
            ariaLabel="Ingresos por cliente"
          />
        ) : (
          <EmptyChart height={CHART_H - 40} />
        )}
      </ChartCard>
    </div>
  )
}
