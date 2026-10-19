import { useMemo } from 'react'
import { ChartCard, EmptyChart } from '../../../home/financiero/ChartCard'
import { EChart } from '../../../home/financiero/EChart'
import { horizontalBars, periodColumns, treemap } from '../../../home/financiero/charts'
import { fmt } from '../../../home/financiero/theme'
import { RANKING, colorById } from '../colors'
import {
  ESTADO,
  MonFilters,
  MonModel,
  clientLabel,
  colorCumplimiento,
  estadoMensual,
  filterRows,
  monthLabel,
  periodSummary,
  projectLabel,
  sumBy,
  todayISO,
} from '../model'
import { TeamCards } from './TeamCards'
import { WorkerTable } from './WorkerTable'

export type VistaMensual = 'ranking' | 'variacion'

interface Props {
  model: MonModel
  /** 'YYYY-MM' o 'all' */
  month: string
  view: VistaMensual
  filters: MonFilters
  selUsers: number[]
  onSelectClient: (id: number | null) => void
  onSelectProject: (id: number, multi: boolean) => void
  onSelectUser: (id: number, multi: boolean) => void
}

/** Dedicación semanal sumada: 1 = una persona a tiempo completo durante una semana */
const fmtSemanas = (v: number) =>
  `${v.toLocaleString('es-CL', { maximumFractionDigits: 1 })} sem.`

export function MensualPage(props: Props) {
  const { model, month, view, filters, selUsers, onSelectClient, onSelectProject, onSelectUser } = props
  const inMonth = (m: string) => month === 'all' || m === month
  const periodo = month === 'all' ? 'todo el período' : monthLabel(month)

  const dedRows = useMemo(() => model.dedications.filter((r) => inMonth(r.month)), [model, month]) // eslint-disable-line react-hooks/exhaustive-deps
  const ajRows = useMemo(() => model.aj.filter((r) => inMonth(r.month)), [model, month]) // eslint-disable-line react-hooks/exhaustive-deps

  // Tarjetas del período (todo el equipo, con filtro de cliente)
  const summary = useMemo(
    () => periodSummary(model, filterRows(dedRows, filters, ['user', 'project'])),
    [model, dedRows, filters]
  )

  // Ranking: % de la dedicación mensual (dedications_aj) por cliente; con un solo
  // cliente elegido se abre por proyecto (como el "drill down" de Power BI)
  const drillClient = filters.client.length === 1 ? filters.client[0] : null
  const ranking = useMemo(() => {
    const userFilter = selUsers.length ? selUsers : filters.user
    const rows = filterRows(ajRows, { ...filters, user: userFilter }, ['project'])
    const total = rows.reduce((s, r) => s + r.prop, 0)
    const groups = drillClient === null ? sumBy(rows, (r) => r.client, (r) => r.prop) : sumBy(rows, (r) => r.project, (r) => r.prop)
    return [...groups]
      .map(([id, v]) => ({
        id: id as number,
        label: drillClient === null ? clientLabel(model, id as number) : projectLabel(model, id as number),
        share: total ? v / total : 0,
      }))
      .filter((x) => x.share > 0)
      .sort((a, b) => b.share - a.share)
  }, [model, ajRows, filters, selUsers, drillClient])

  // Tabla mensual: proporción del mes y estado (≥ 98 % = completo)
  const workers = useMemo(() => {
    const ref = month === 'all' ? todayISO().slice(0, 7) : month
    const filtered = sumBy(filterRows(ajRows, filters, ['user']), (r) => r.user, (r) => r.prop)
    const delMes = sumBy(model.aj.filter((r) => r.month === ref), (r) => r.user, (r) => r.prop)
    const visible = filters.user.length ? model.users.filter((u) => filters.user.includes(u.id)) : model.users
    return visible.map((u) => ({
      id: u.id,
      name: u.name,
      value: filtered.get(u.id) ?? 0,
      estado: estadoMensual(delMes.get(u.id) ?? 0),
    }))
  }, [model, ajRows, filters, month])

  // Variación: dedicación por mes y cliente, proyecto top y proporción por trabajador
  const variacion = useMemo(() => {
    const rows = filterRows(dedRows, filters)
    // El gráfico de variación compara meses: muestra los 6 meses hasta el mes elegido
    const idx = model.months.indexOf(month)
    const ventana = month === 'all' || idx < 0 ? null : model.months.slice(idx, idx + 6)
    const evolRows = filterRows(
      ventana ? model.dedications.filter((r) => ventana.includes(r.month)) : dedRows,
      filters
    )
    const byProject = sumBy(rows, (r) => r.project, (r) => r.ded)
    const total = rows.reduce((s, r) => s + r.ded, 0)
    const top = [...byProject].sort((a, b) => b[1] - a[1])[0]
    const months = ventana ? [...ventana].reverse() : [...new Set(rows.map((r) => r.month))].sort()
    const clientIds = [...new Set(evolRows.map((r) => r.client ?? -1))]
    const byMonthClient = sumBy(evolRows, (r) => `${r.month}|${r.client ?? -1}`, (r) => r.ded)
    const clientTotals = sumBy(evolRows, (r) => r.client ?? -1, (r) => r.ded)
    clientIds.sort((a, b) => (clientTotals.get(b) ?? 0) - (clientTotals.get(a) ?? 0))
    const byUser = sumBy(filterRows(ajRows, filters), (r) => r.user, (r) => r.prop)
    return {
      top: top ? { id: top[0] as number, share: total ? top[1] / total : 0, value: top[1] } : null,
      months,
      clientIds,
      byMonthClient,
      users: [...byUser].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]),
    }
  }, [model, month, dedRows, ajRows, filters])

  const estadoMes = useMemo(() => new Map(workers.map((w) => [w.id, w.estado])), [workers])

  const options = useMemo(() => {
    const max = ranking[0]?.share ?? 0
    const allClients = [...model.clientNames.keys()].sort((a, b) => a - b)
    const allUsers = model.users.map((u) => u.id)
    return {
      ranking: horizontalBars(
        ranking.map((r) => ({ key: String(r.id), label: r.label })),
        [
          {
            name: '% del mes',
            color: RANKING.resto,
            values: ranking.map((r) => r.share),
            itemColors: ranking.map((r) => (r.share === max ? RANKING.top : RANKING.resto)),
          },
        ],
        new Set((drillClient === null ? filters.client : filters.project).map(String)),
        (v) => fmt.pct(v),
        (v) => fmt.pct(v)
      ),
      stacked: periodColumns(
        variacion.months,
        variacion.clientIds.map((c) => ({
          name: clientLabel(model, c < 0 ? null : c),
          color: colorById(allClients, c),
          values: variacion.months.map((m) => variacion.byMonthClient.get(`${m}|${c}`) ?? 0),
        })),
        new Set(month === 'all' ? [] : [month]),
        fmtSemanas,
        (v) => v.toLocaleString('es-CL', { maximumFractionDigits: 1 }),
        false,
        true
      ),
      treemap: treemap(
        variacion.users.map(([id, v]) => ({
          key: String(id),
          label: model.userNames.get(id as number) ?? `Usuario ${id}`,
          value: v,
        })),
        variacion.users.map(([id]) => colorById(allUsers, id as number)),
        new Set(selUsers.map(String)),
        (v) => fmt.pct(v),
        (v) => fmt.pct(v)
      ),
    }
  }, [model, month, ranking, variacion, filters, selUsers, drillClient])

  const workerTable = (
    <ChartCard
      title="Detalle por trabajador"
      subtitle={`Proporción del mes (${periodo}). Estado: completo desde 98 %`}
    >
      <WorkerTable
        rows={workers}
        valueLabel="Proporción"
        format={(v) => fmt.pct(v)}
        selected={selUsers}
        onSelect={onSelectUser}
      />
    </ChartCard>
  )

  const estimado = month === 'all' ? model.ajEstimated.size > 0 : model.ajEstimated.has(month)
  const aviso = estimado && (
    <p className="lg:col-span-12 rounded-lg bg-white/70 ring-1 ring-black/10 px-3 py-2 text-xs text-[#52514e]">
      <b className="text-[#303031]">Proporción mensual estimada:</b>{' '}
      {month === 'all'
        ? 'algunos meses aún no tienen dedicación mensual ajustada en la base'
        : `${monthLabel(month)} aún no tiene dedicación mensual ajustada en la base`}
      , así que se calcula desde las dedicaciones semanales (dedicación del mes ÷ semanas registradas). Cuando la
      base la genere, se usará automáticamente.
    </p>
  )

  if (view === 'ranking') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {aviso}
        <div className="lg:col-span-12">
          <TeamCards
            summary={summary}
            labels={{
              completos: 'Completos en el período',
              incompletos: 'Incompletos en el período',
              sin: 'Sin registro en el período',
            }}
            cumplimientoColor={colorCumplimiento(summary.cumplimiento)}
            hint={periodo}
          />
          <p className="text-xs text-[#52514e] mt-2">
            Completo = registró el 100 % en todas las semanas del período.
          </p>
        </div>
        <div className="lg:col-span-5">{workerTable}</div>
        <ChartCard
          className="lg:col-span-7"
          title={drillClient === null ? 'Ranking mensual por cliente' : `Ranking de proyectos · ${clientLabel(model, drillClient)}`}
          subtitle={
            drillClient === null
              ? 'Haz clic en un cliente para ver sus proyectos'
              : 'Haz clic en un proyecto para filtrar la tabla'
          }
          legend={[
            { label: 'Mayor dedicación', color: RANKING.top },
            { label: 'Resto', color: RANKING.resto },
          ]}
          table={{
            columns: [drillClient === null ? 'Cliente' : 'Cliente · Proyecto', '% del mes'],
            numeric: [1],
            rows: ranking.map((r) => [r.label, fmt.pct(r.share)]),
          }}
        >
          {drillClient !== null && (
            <button
              type="button"
              onClick={() => onSelectClient(null)}
              className="self-start mb-2 text-xs font-semibold text-[#303031] hover:underline"
            >
              ← Volver a todos los clientes
            </button>
          )}
          {ranking.length ? (
            <EChart
              option={options.ranking}
              height={Math.max(260, Math.min(ranking.length, 12) * 30 + 40)}
              categoryAxis="y"
              onAxisClick={(i, multi) => {
                const r = ranking[ranking.length - 1 - i]
                if (!r) return
                if (drillClient === null) onSelectClient(r.id)
                else onSelectProject(r.id, multi)
              }}
              ariaLabel="Ranking mensual"
            />
          ) : (
            <EmptyChart height={260} />
          )}
        </ChartCard>
      </div>
    )
  }

  // Vista "Variación mensual"
  const top = variacion.top
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {aviso}
      <div
        className="lg:col-span-12 bg-white rounded-xl ring-1 ring-black/10 px-4 py-3 border-l-4"
        style={{ borderLeftColor: RANKING.top }}
      >
        <p className="text-xs font-medium text-[#52514e]">Proyecto con más dedicación · {periodo}</p>
        <p className="text-2xl font-semibold mt-1 text-[#252423]">{top ? projectLabel(model, top.id) : '—'}</p>
        {top && (
          <p className="text-xs text-[#898781] mt-1">
            {fmt.pct(top.share)} de la dedicación del período ({fmtSemanas(top.value)})
          </p>
        )}
      </div>

      <ChartCard
        className="lg:col-span-7"
        title="Variación mensual por cliente"
        subtitle={`${month === 'all' ? 'Todos los meses' : `6 meses hasta ${monthLabel(month)}`}. Dedicación sumada por mes (1 sem. = una persona a tiempo completo durante una semana)`}
        legend={variacion.clientIds.slice(0, 12).map((c) => ({
          label: clientLabel(model, c < 0 ? null : c),
          color: colorById([...model.clientNames.keys()].sort((a, b) => a - b), c),
        }))}
        table={{
          columns: ['Mes', 'Cliente', 'Dedicación'],
          numeric: [2],
          rows: variacion.months.flatMap((m) =>
            variacion.clientIds
              .filter((c) => (variacion.byMonthClient.get(`${m}|${c}`) ?? 0) > 0)
              .map((c) => [monthLabel(m), clientLabel(model, c < 0 ? null : c), fmtSemanas(variacion.byMonthClient.get(`${m}|${c}`) ?? 0)])
          ),
        }}
      >
        {variacion.months.length ? (
          <EChart option={options.stacked} height={360} ariaLabel="Dedicación por mes y cliente" />
        ) : (
          <EmptyChart height={360} />
        )}
      </ChartCard>

      <ChartCard
        className="lg:col-span-5"
        title="Proporción por trabajador"
        subtitle="Haz clic en un trabajador para filtrar"
        table={{
          columns: ['Trabajador', 'Proporción', 'Estado del mes'],
          numeric: [1],
          rows: variacion.users.map(([id, v]) => [
            model.userNames.get(id as number) ?? '',
            fmt.pct(v),
            ESTADO[estadoMes.get(id as number) ?? 'sin'].label,
          ]),
        }}
      >
        {variacion.users.length ? (
          <EChart
            option={options.treemap}
            height={360}
            onItemClick={(e, multi) => onSelectUser(Number((e.data as { key: string }).key), multi)}
            ariaLabel="Proporción de dedicación por trabajador"
          />
        ) : (
          <EmptyChart height={360} />
        )}
      </ChartCard>
    </div>
  )
}
