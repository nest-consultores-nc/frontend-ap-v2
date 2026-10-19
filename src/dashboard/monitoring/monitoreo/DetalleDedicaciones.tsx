import { useMemo, useState } from 'react'
import { fmt } from '../../home/financiero/theme'
import { EstadoChip } from './EstadoChip'
import {
  DedRow,
  ESTADO,
  Estado,
  MonFilters,
  MonModel,
  TOL,
  clientLabel,
  estadoMensual,
  estadoSemanal,
  filterRows,
  monthLabel,
  sumBy,
  todayISO,
  weekLabel,
} from './model'

export type Periodo = { type: 'week'; week: string } | { type: 'month'; month: string }

interface Props {
  model: MonModel
  periodo: Periodo
  filters: MonFilters
  /** trabajadores elegidos con clic (se resaltan) */
  selUsers: number[]
  /** filtra el dashboard por ese trabajador (otro clic lo quita) */
  onSelectUser: (id: number) => void
}

const ORDEN_ESTADO: Record<Estado, number> = { sin: 0, incompleto: 1, completo: 2 }

/**
 * Detalle de dedicaciones por trabajador (versión mejorada del listado que
 * estaba bajo el reporte de Power BI). Sigue la semana o el mes elegido arriba.
 */
export function DetalleDedicaciones({ model, periodo, filters, selUsers, onSelectUser }: Props) {
  const [query, setQuery] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<Estado | 'todos'>('todos')
  const [orden, setOrden] = useState<'nombre' | 'estado'>('nombre')
  const [abiertos, setAbiertos] = useState<Set<number>>(new Set())

  const esSemana = periodo.type === 'week'
  const titulo = esSemana ? weekLabel(periodo.week) : periodo.month === 'all' ? 'Todo el período' : monthLabel(periodo.month)

  const trabajadores = useMemo(() => {
    const enPeriodo = (r: DedRow) =>
      periodo.type === 'week' ? r.week === periodo.week : periodo.month === 'all' || r.month === periodo.month
    const delPeriodo = model.dedications.filter(enPeriodo)
    const rows = filterRows(delPeriodo, filters, ['project'])
    const porUsuario = new Map<number, DedRow[]>()
    rows.forEach((r) => porUsuario.set(r.user, [...(porUsuario.get(r.user) ?? []), r]))

    // Estado: semanal = su semana completa (sin filtro de cliente); mensual = dedications_aj del mes
    const totalSemana = sumBy(delPeriodo, (r) => r.user, (r) => r.ded)
    const mesRef = periodo.type === 'month' && periodo.month !== 'all' ? periodo.month : todayISO().slice(0, 7)
    const propMes = sumBy(model.aj.filter((r) => r.month === mesRef), (r) => r.user, (r) => r.prop)
    const semanasEquipo = new Set(delPeriodo.map((r) => r.date))

    // El resumen mira toda la semana/mes del trabajador (igual que el estado);
    // el filtro de cliente solo limita qué proyectos se listan al expandir
    const semanasPorUsuario = sumBy(delPeriodo, (r) => `${r.user}|${r.date}`, (r) => r.ded)
    const sinFiltroLabel = filters.client.length ? ' del cliente elegido' : ''

    const visibles = filters.user.length ? model.users.filter((u) => filters.user.includes(u.id)) : model.users
    return visibles.map((u) => {
      const items = (porUsuario.get(u.id) ?? []).sort((a, b) => b.date.localeCompare(a.date) || b.ded - a.ded)
      const registro = totalSemana.has(u.id)
      let resumen: string
      let estado: Estado
      if (periodo.type === 'week') {
        estado = estadoSemanal(totalSemana.get(u.id) ?? 0, registro)
        resumen = registro ? `${fmt.pct(totalSemana.get(u.id) ?? 0)} de la semana` : 'Sin registros'
      } else {
        estado = estadoMensual(propMes.get(u.id) ?? 0)
        let completas = 0
        semanasEquipo.forEach((w) => {
          if ((semanasPorUsuario.get(`${u.id}|${w}`) ?? 0) >= 1 - TOL) completas++
        })
        resumen = registro ? `${completas} de ${semanasEquipo.size} semanas completas` : 'Sin registros'
      }
      if (registro && items.length === 0 && sinFiltroLabel) resumen += ` · sin proyectos${sinFiltroLabel}`
      return { id: u.id, name: u.name, items, estado, resumen, pendientes: items.filter((r) => !r.cons).length }
    })
  }, [model, periodo, filters])

  const conteo = useMemo(() => {
    const c: Record<Estado, number> = { completo: 0, incompleto: 0, sin: 0 }
    trabajadores.forEach((t) => c[t.estado]++)
    return c
  }, [trabajadores])

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase()
    return trabajadores
      .filter((t) => (estadoFiltro === 'todos' || t.estado === estadoFiltro) && (!q || t.name.toLowerCase().includes(q)))
      .sort((a, b) =>
        orden === 'estado'
          ? ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado] || a.name.localeCompare(b.name, 'es')
          : a.name.localeCompare(b.name, 'es')
      )
  }, [trabajadores, query, estadoFiltro, orden])

  const toggle = (id: number) =>
    setAbiertos((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  const todosAbiertos = visibles.length > 0 && visibles.every((t) => abiertos.has(t.id))

  return (
    <section className="bg-white rounded-xl ring-1 ring-black/10 p-4 mt-4">
      <header className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#0b0b0b]">Detalle de dedicaciones</h3>
          <p className="text-xs text-[#52514e] mt-0.5">
            {titulo} · proyectos registrados por cada trabajador
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAbiertos(todosAbiertos ? new Set() : new Set(visibles.map((t) => t.id)))}
          className="text-xs font-semibold text-[#303031] px-2 py-1 rounded-md hover:bg-black/5"
        >
          {todosAbiertos ? 'Contraer todo' : 'Expandir todo'}
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar trabajador…"
          aria-label="Buscar trabajador"
          className="h-9 w-full sm:w-56 px-3 text-sm rounded-lg border-0 ring-1 ring-black/15 focus:ring-2 focus:ring-[#CDEA80]"
        />
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrar por estado">
          {(['todos', 'completo', 'incompleto', 'sin'] as const).map((e) => {
            const activo = estadoFiltro === e
            const n = e === 'todos' ? trabajadores.length : conteo[e]
            return (
              <button
                key={e}
                type="button"
                aria-pressed={activo}
                onClick={() => setEstadoFiltro(e)}
                className={`h-9 px-3 rounded-lg text-xs font-semibold ring-1 transition-colors ${
                  activo ? 'bg-[#303031] text-white ring-[#303031]' : 'bg-white text-[#303031] ring-black/15 hover:ring-black/30'
                }`}
              >
                {e === 'todos' ? 'Todos' : ESTADO[e].label} ({n})
              </button>
            )
          })}
        </div>
        <label className="ml-auto flex items-center gap-2 text-xs text-[#52514e]">
          Ordenar por
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as 'nombre' | 'estado')}
            className="h-9 pl-2 pr-8 text-sm rounded-lg border-0 ring-1 ring-black/15 focus:ring-2 focus:ring-[#CDEA80]"
          >
            <option value="nombre">Nombre</option>
            <option value="estado">Estado</option>
          </select>
        </label>
      </div>

      {visibles.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#898781]">No hay trabajadores que coincidan.</p>
      ) : (
        <ul className="divide-y divide-[#e1e0d9] border border-[#e1e0d9] rounded-lg overflow-hidden">
          {visibles.map((t) => {
            const abierto = abiertos.has(t.id)
            return (
              <li key={t.id} className={selUsers.includes(t.id) ? 'bg-[#CDEA80]/25' : ''}>
                <div className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => toggle(t.id)}
                  aria-expanded={abierto}
                  className="flex-1 min-w-0 flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left hover:bg-[#EDEBE5]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#CDEA80]"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    className={`shrink-0 text-[#52514e] transition-transform ${abierto ? 'rotate-90' : ''}`}
                  >
                    <path d="M7.5 5 12.5 10l-5 5" stroke="currentColor" strokeWidth="1.8" fill="none" />
                  </svg>
                  <span className="font-medium text-[#0b0b0b] flex-1 min-w-[140px]">{t.name}</span>
                  <span className="text-xs text-[#52514e]">{t.resumen}</span>
                  {t.pendientes > 0 && (
                    <span className="text-xs text-[#52514e]">
                      · {t.pendientes} sin consolidar
                    </span>
                  )}
                  <EstadoChip estado={t.estado} />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectUser(t.id)}
                  aria-pressed={selUsers.includes(t.id)}
                  title={selUsers.includes(t.id) ? 'Quitar filtro' : 'Filtrar el dashboard por este trabajador'}
                  className={`shrink-0 px-3 text-xs font-semibold border-l border-[#e1e0d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#CDEA80] ${
                    selUsers.includes(t.id) ? 'bg-[#303031] text-white' : 'text-[#303031] hover:bg-[#EDEBE5]/60'
                  }`}
                >
                  {selUsers.includes(t.id) ? 'Filtrado ×' : 'Filtrar'}
                </button>
                </div>

                {abierto && (
                  <div className="px-4 pb-4 bg-[#EDEBE5]/30">
                    {t.items.length === 0 ? (
                      <p className="py-3 text-sm text-[#898781]">No registró dedicación en este período.</p>
                    ) : (
                      <>
                        {/* Escritorio: tabla */}
                        <table className="hidden sm:table w-full text-sm mt-2">
                          <thead>
                            <tr className="text-xs text-[#52514e] border-b border-[#e1e0d9]">
                              {!esSemana && <th className="py-2 pr-3 text-left font-medium">Semana</th>}
                              <th className="py-2 pr-3 text-left font-medium">Cliente</th>
                              <th className="py-2 pr-3 text-left font-medium">Proyecto</th>
                              <th className="py-2 pr-3 text-right font-medium">Dedicación</th>
                              <th className="py-2 text-left font-medium">Consolidación</th>
                            </tr>
                          </thead>
                          <tbody>
                            {t.items.map((r) => (
                              <tr key={r.id} className="border-b border-[#e1e0d9]/60 last:border-0">
                                {!esSemana && <td className="py-2 pr-3 text-[#52514e] whitespace-nowrap">{weekLabel(r.week).replace('Semana del ', '')}</td>}
                                <td className="py-2 pr-3">{clientLabel(model, r.client)}</td>
                                <td className="py-2 pr-3">{model.projects.get(r.project)?.name ?? `Proyecto ${r.project}`}</td>
                                <td className="py-2 pr-3 text-right tabular-nums">{fmt.pct(r.ded)}</td>
                                <td className="py-2">
                                  <Consolidacion ok={r.cons} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Móvil: tarjetas */}
                        <div className="sm:hidden space-y-2 mt-2">
                          {t.items.map((r) => (
                            <div key={r.id} className="bg-white rounded-lg ring-1 ring-black/10 p-3 text-sm">
                              {!esSemana && <p className="text-xs text-[#52514e] mb-1">{weekLabel(r.week)}</p>}
                              <p className="font-medium">{model.projects.get(r.project)?.name ?? `Proyecto ${r.project}`}</p>
                              <p className="text-xs text-[#52514e]">{clientLabel(model, r.client)}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-semibold tabular-nums">{fmt.pct(r.ded)}</span>
                                <Consolidacion ok={r.cons} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Consolidacion({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="text-xs font-medium text-[#1D9E75]">✓ Consolidada</span>
  ) : (
    <span className="text-xs font-medium text-[#52514e]">○ Pendiente</span>
  )
}
