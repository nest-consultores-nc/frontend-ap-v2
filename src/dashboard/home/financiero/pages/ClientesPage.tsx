import { useMemo } from 'react'
import { applyFilters, clientName, groupSum, periodRange, ratios } from '../model'
import { categoryColumns, periodColumns, scatter } from '../charts'
import { ChartCard, EmptyChart } from '../ChartCard'
import { EChart } from '../EChart'
import { StatTile } from '../StatTile'
import { PBI, fmt, gradient, periodLabel } from '../theme'
import { CHART_H, PageProps, selectedSet } from './shared'

export function ClientesPage({ model, filters, select }: PageProps) {
  const totals = useMemo(() => ratios(applyFilters(model.utilidad, filters)), [model, filters])

  // Ingreso, costo y utilidad por cliente (tabla utilidad)
  const byClient = useMemo(() => {
    const g = groupSum(applyFilters(model.utilidad, filters, 'client'), (r) => r.client, ['ing', 'cost', 'util'])
    return [...g]
      .map(([id, v]) => ({ id, name: clientName(model, id), ing: v.ing, cost: v.cost, util: v.util }))
      .sort((a, b) => b.util - a.util)
  }, [model, filters])

  // Clientes creados por mes. Como en Power BI, solo lo afecta el filtro de cliente
  // (la tabla clients no se relaciona con el Calendario ni recibe filtros de proyecto).
  const created = useMemo(() => {
    const sel = new Set(filters.client.map(Number))
    const rows = model.clients.filter((c) => c.period && (sel.size === 0 || sel.has(c.id)))
    const counts = new Map<string, number>()
    rows.forEach((c) => counts.set(c.period!, (counts.get(c.period!) ?? 0) + 1))
    const periods = periodRange([...counts.keys()])
    return { periods, counts: periods.map((p) => counts.get(p) ?? 0) }
  }, [model, filters])

  const options = useMemo(() => {
    const sel = selectedSet(filters, 'client')
    return {
      util: categoryColumns(
        byClient.map((c) => ({ key: String(c.id), label: c.name })),
        byClient.map((c) => c.util),
        byClient.map((c) => gradient(PBI.utilidadCliente, byClient.map((x) => x.util))(c.util)),
        sel,
        'Utilidad',
        fmt.clp,
        fmt.clpShort
      ),
      created: periodColumns(
        created.periods,
        [
          {
            name: 'Clientes nuevos',
            color: PBI.cantidadClientes[1],
            values: created.counts,
            itemColors: created.counts.map(gradient(PBI.cantidadClientes, created.counts)),
          },
        ],
        new Set(),
        fmt.int,
        fmt.int,
        true
      ),
      scatter: scatter(
        byClient.map((c) => ({ key: String(c.id), label: c.name, x: c.cost, y: c.ing })),
        // Un color por cliente con los colores del tema, fijo según el id del cliente
        byClient.map((c) => PBI.theme[c.id % PBI.theme.length]),
        sel
      ),
    }
  }, [byClient, created, filters])

  const clientTable = {
    columns: ['Cliente', 'Ingreso', 'Costo', 'Utilidad'],
    numeric: [1, 2, 3],
    rows: byClient.map((c) => [c.name, fmt.clp(c.ing), fmt.clp(c.cost), fmt.clp(c.util)]),
  }

  const onClient = (i: number, multi: boolean) => byClient[i] && select('client', byClient[i].id, multi)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <ChartCard
        className="lg:col-span-7"
        title="Distribución de clientes"
        subtitle="Costo vs ingreso. Sobre la diagonal, el cliente deja utilidad"
        table={clientTable}
      >
        {byClient.length ? (
          <EChart
            option={options.scatter}
            height={CHART_H + 120}
            onItemClick={(e, multi) => select('client', Number((e.data as { key: string }).key), multi)}
            ariaLabel="Costo e ingreso por cliente"
          />
        ) : (
          <EmptyChart height={CHART_H + 120} />
        )}
      </ChartCard>

      <div className="lg:col-span-5 grid grid-cols-1 gap-4 content-start">
        <ChartCard
          title="Cantidad de clientes"
          subtitle="Clientes nuevos según fecha de creación"
          table={{
            columns: ['Mes', 'Clientes nuevos'],
            numeric: [1],
            rows: created.periods.map((p, i) => [periodLabel(p), created.counts[i]]),
          }}
        >
          {created.periods.length ? (
            <EChart option={options.created} height={200} ariaLabel="Clientes nuevos por mes" />
          ) : (
            <EmptyChart height={200} />
          )}
        </ChartCard>

        <div className="grid grid-cols-3 gap-4">
          <StatTile label="Margen" value={fmt.pct(totals.margen)} hint="Utilidad / Ingreso" />
          <StatTile label="Productividad" value={fmt.pct(totals.productividad)} hint="Utilidad / Costo" color={PBI.productividad} />
          <StatTile label="Eficiencia" value={fmt.pct(totals.eficiencia)} hint="Costo / Ingreso" />
        </div>
      </div>

      <ChartCard className="lg:col-span-12" title="Utilidad por cliente" table={clientTable}>
        {byClient.length ? (
          <EChart option={options.util} height={CHART_H} onAxisClick={onClient} ariaLabel="Utilidad por cliente" />
        ) : (
          <EmptyChart height={CHART_H} />
        )}
      </ChartCard>
    </div>
  )
}
