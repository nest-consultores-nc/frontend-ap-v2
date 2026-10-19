import { useMemo } from 'react'
import { ChartCard, EmptyChart } from '../../../home/financiero/ChartCard'
import { EChart } from '../../../home/financiero/EChart'
import { horizontalBars } from '../../../home/financiero/charts'
import { fmt } from '../../../home/financiero/theme'
import { RANKING } from '../colors'
import {
  MonFilters,
  MonModel,
  colorCumplimiento,
  estadoSemanal,
  filterRows,
  projectLabel,
  sumBy,
  weekLabel,
  weeklySummary,
} from '../model'
import { TeamCards } from './TeamCards'
import { WorkerTable } from './WorkerTable'

interface Props {
  model: MonModel
  week: string
  filters: MonFilters
  /** trabajadores elegidos con clic en la tabla (filtran el gráfico, no las tarjetas) */
  selUsers: number[]
  onSelectProject: (id: number, multi: boolean) => void
  onSelectUser: (id: number, multi: boolean) => void
}

export function SemanalPage({ model, week, filters, selUsers, onSelectProject, onSelectUser }: Props) {
  const weekRows = useMemo(() => model.dedications.filter((r) => r.week === week), [model, week])

  // Tarjetas: todo el equipo activo, solo con el filtro de cliente (como en Power BI)
  const summary = useMemo(
    () => weeklySummary(model, filterRows(weekRows, filters, ['user', 'project'])),
    [model, weekRows, filters]
  )

  // Gráfico: % de la dedicación de la semana por Cliente · Proyecto
  const byProject = useMemo(() => {
    const userFilter = selUsers.length ? selUsers : filters.user
    const rows = filterRows(weekRows, { ...filters, user: userFilter }, ['project'])
    const total = rows.reduce((s, r) => s + r.ded, 0)
    return [...sumBy(rows, (r) => r.project, (r) => r.ded)]
      .map(([id, v]) => ({ id: id as number, share: total ? v / total : 0 }))
      .filter((x) => x.share > 0)
      .sort((a, b) => b.share - a.share)
  }, [weekRows, filters, selUsers])

  // Tabla: dedicación de cada trabajador (con filtros de cliente/proyecto) y su estado
  // (el estado mira toda su semana, sin filtros de cliente ni proyecto, como en Power BI)
  const workers = useMemo(() => {
    const filtered = sumBy(filterRows(weekRows, filters, ['user']), (r) => r.user, (r) => r.ded)
    const full = sumBy(weekRows, (r) => r.user, (r) => r.ded)
    const visible = filters.user.length ? model.users.filter((u) => filters.user.includes(u.id)) : model.users
    return visible.map((u) => ({
      id: u.id,
      name: u.name,
      value: filtered.get(u.id) ?? 0,
      estado: estadoSemanal(full.get(u.id) ?? 0, full.has(u.id)),
    }))
  }, [model, weekRows, filters])

  const chartOption = useMemo(() => {
    const max = byProject[0]?.share ?? 0
    return horizontalBars(
      byProject.map((p) => ({ key: String(p.id), label: projectLabel(model, p.id) })),
      [
        {
          name: '% de la semana',
          color: RANKING.resto,
          values: byProject.map((p) => p.share),
          itemColors: byProject.map((p) => (p.share === max ? RANKING.top : RANKING.resto)),
        },
      ],
      new Set(filters.project.map(String)),
      (v) => fmt.pct(v),
      (v) => fmt.pct(v)
    )
  }, [model, byProject, filters.project])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-12">
        <TeamCards
          summary={summary}
          labels={{
            completos: 'Con dedicación completa',
            incompletos: 'Con dedicación incompleta',
            sin: 'Sin registro',
          }}
          cumplimientoColor={colorCumplimiento(summary.cumplimiento)}
          hint={weekLabel(week)}
        />
      </div>

      <ChartCard
        className="lg:col-span-5"
        title="Detalle por trabajador"
        subtitle="Haz clic en un trabajador para ver sus proyectos en el gráfico"
      >
        <WorkerTable
          rows={workers}
          valueLabel="Dedicación"
          format={(v) => fmt.pct(v)}
          selected={selUsers}
          onSelect={onSelectUser}
        />
      </ChartCard>

      <ChartCard
        className="lg:col-span-7"
        title={`Ranking por proyecto · ${weekLabel(week)}`}
        subtitle="% de la dedicación de la semana. Haz clic en un proyecto para filtrar la tabla"
        legend={[
          { label: 'Proyecto con más dedicación', color: RANKING.top },
          { label: 'Resto', color: RANKING.resto },
        ]}
        table={{
          columns: ['Cliente · Proyecto', '% de la semana'],
          numeric: [1],
          rows: byProject.map((p) => [projectLabel(model, p.id), fmt.pct(p.share)]),
        }}
      >
        {byProject.length ? (
          <EChart
            option={chartOption}
            height={Math.max(260, Math.min(byProject.length, 12) * 30 + 40)}
            categoryAxis="y"
            onAxisClick={(i, multi) => {
              const p = byProject[byProject.length - 1 - i]
              if (p) onSelectProject(p.id, multi)
            }}
            ariaLabel="Porcentaje de la semana por proyecto"
          />
        ) : (
          <EmptyChart height={260} />
        )}
      </ChartCard>
    </div>
  )
}
