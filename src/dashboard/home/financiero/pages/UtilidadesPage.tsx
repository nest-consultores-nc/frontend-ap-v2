import { useMemo } from 'react'
import {
  applyFilters,
  divide,
  groupSum,
  onCalendar,
  periodRange,
  projectName,
  ratios,
  typeName,
} from '../model'
import { pie, horizontalBars, periodLine, waterfall } from '../charts'
import { ChartCard, EmptyChart } from '../ChartCard'
import { EChart } from '../EChart'
import { StatTile } from '../StatTile'
import { PBI, WATERFALL, fmt, gradient, periodLabel } from '../theme'
import { CHART_H, PageProps, selectedSet, typeColorUtilidad } from './shared'

export function UtilidadesPage({ model, filters, select }: PageProps) {
  const totals = useMemo(() => ratios(applyFilters(model.utilidad, filters)), [model, filters])

  // Por mes (sin aplicar el filtro de mes del propio gráfico)
  const monthly = useMemo(() => {
    const rows = onCalendar(applyFilters(model.utilidad, filters, 'period'))
    const g = groupSum(rows, (r) => r.period, ['util', 'cost'])
    const periods = periodRange([...g.keys()])
    return {
      periods,
      util: periods.map((p) => g.get(p)?.util ?? 0),
      prod: periods.map((p) => (g.has(p) ? divide(g.get(p)!.util, g.get(p)!.cost) : null)),
    }
  }, [model, filters])

  // Productividad por proyecto, de mayor a menor
  const byProject = useMemo(() => {
    const rows = applyFilters(model.utilidad, filters, 'project')
    const g = groupSum(rows, (r) => r.project, ['util', 'cost'])
    return [...g]
      .map(([id, v]) => ({ id, prod: divide(v.util, v.cost) }))
      .filter((x): x is { id: number; prod: number } => x.prod !== null)
      .sort((a, b) => b.prod - a.prod)
  }, [model, filters])

  // Utilidad por tipo de proyecto (la torta solo admite valores positivos)
  const byType = useMemo(() => {
    const rows = applyFilters(model.utilidad, filters, 'type')
    const g = groupSum(rows, (r) => r.type, ['util'])
    const all = [...g].map(([id, v]) => ({ id, util: v.util }))
    return {
      positive: all.filter((t) => t.util > 0).sort((a, b) => b.util - a.util),
      negative: all.filter((t) => t.util < 0),
    }
  }, [model, filters])

  const selPeriod = selectedSet(filters, 'period')
  const selProject = selectedSet(filters, 'project')
  const selType = selectedSet(filters, 'type')

  const onPeriod = (i: number, multi: boolean) =>
    monthly.periods[i] && select('period', monthly.periods[i], multi)

  const trendOption = useMemo(
    () =>
      periodLine(
        monthly.periods,
        [{ name: 'Productividad', color: PBI.azul, values: monthly.prod as number[] }],
        selPeriod,
        (v) => fmt.pct(v),
        (v) => fmt.pct(v)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthly, filters]
  )

  const waterfallOption = useMemo(
    () => waterfall(monthly.periods, monthly.util, selPeriod),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthly, filters]
  )

  const projectOption = useMemo(
    () =>
      horizontalBars(
        byProject.map((p) => ({ key: String(p.id), label: projectName(model, p.id) })),
        [
          {
            name: 'Rentabilidad',
            color: PBI.rentabilidadProyecto[1],
            values: byProject.map((p) => p.prod),
            itemColors: byProject.map((p) => gradient(PBI.rentabilidadProyecto, byProject.map((x) => x.prod))(p.prod)),
          },
        ],
        selProject,
        (v) => fmt.pct(v),
        (v) => fmt.pct(v)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [byProject, model, filters]
  )

  const typeOption = useMemo(
    () =>
      pie(
        byType.positive.map((t) => ({
          key: String(t.id),
          label: typeName(model, t.id),
          value: t.util,
          color: typeColorUtilidad(model, t.id),
        })),
        selType,
        fmt.clp
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [byType, model, filters]
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
        <ChartCard
          title="Tendencia mensual"
          subtitle="Productividad (Utilidad / Costo)"
          table={{
            columns: ['Mes', 'Productividad'],
            numeric: [1],
            rows: monthly.periods.map((p, i) => [periodLabel(p), fmt.pct(monthly.prod[i])]),
          }}
        >
          {monthly.periods.length ? (
            <EChart option={trendOption} height={200} onAxisClick={onPeriod} ariaLabel="Productividad por mes" />
          ) : (
            <EmptyChart height={200} />
          )}
        </ChartCard>

        <div className="grid grid-cols-1 gap-4 content-start">
          <StatTile label="Rentabilidad ($)" value={fmt.clp(totals.util)} hint="Utilidad total" color={PBI.azul} />
          <StatTile label="Rentabilidad (%)" value={fmt.pct(totals.productividad)} hint="Utilidad / Costo" color={PBI.azul} />
        </div>

        <ChartCard
          title="Utilidades por tipo de proyecto"
          legend={byType.positive.map((t) => ({ label: typeName(model, t.id), color: typeColorUtilidad(model, t.id) }))}
          subtitle={
            byType.negative.length
              ? `${byType.negative.length} tipo(s) con pérdida no aparecen en la torta; revisa la tabla`
              : undefined
          }
          table={{
            columns: ['Tipo', 'Utilidad'],
            numeric: [1],
            rows: [...byType.positive, ...byType.negative].map((t) => [typeName(model, t.id), fmt.clp(t.util)]),
          }}
        >
          {byType.positive.length ? (
            <EChart
              option={typeOption}
              height={CHART_H}
              onItemClick={(e, multi) => select('type', Number((e.data as { key: string }).key), multi)}
              ariaLabel="Utilidad por tipo de proyecto"
            />
          ) : (
            <EmptyChart height={CHART_H} />
          )}
        </ChartCard>

        <ChartCard
          title="(%) Rentabilidad por proyecto"
          subtitle="Utilidad / Costo"
          table={{
            columns: ['Proyecto', 'Rentabilidad'],
            numeric: [1],
            rows: byProject.map((p) => [projectName(model, p.id), fmt.pct(p.prod)]),
          }}
        >
          {byProject.length ? (
            <EChart
              option={projectOption}
              height={CHART_H}
              categoryAxis="y"
              onAxisClick={(i, multi) => {
                const p = byProject[byProject.length - 1 - i]
                if (p) select('project', p.id, multi)
              }}
              ariaLabel="Rentabilidad por proyecto"
            />
          ) : (
            <EmptyChart height={CHART_H} />
          )}
        </ChartCard>
      </div>

      <ChartCard
        className="lg:col-span-6"
        title="Evolución de utilidades"
        subtitle="Cuánto suma o resta cada mes a la utilidad acumulada"
        legend={[
          { label: 'Aumento', color: WATERFALL.up },
          { label: 'Disminución', color: WATERFALL.down },
          { label: 'Total', color: WATERFALL.total },
        ]}
        table={{
          columns: ['Mes', 'Utilidad del mes'],
          numeric: [1],
          rows: monthly.periods.map((p, i) => [periodLabel(p), fmt.clp(monthly.util[i])]),
        }}
      >
        {monthly.periods.length ? (
          <EChart
            option={waterfallOption}
            height={CHART_H * 2 + 80}
            onAxisClick={onPeriod}
            ariaLabel="Evolución de utilidades por mes"
          />
        ) : (
          <EmptyChart height={CHART_H * 2 + 80} />
        )}
      </ChartCard>
    </div>
  )
}
