import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMonitoringDashboard } from '../../../api/dashboards/monitoring'
import { MultiSelect } from '../../home/financiero/FilterBar'
import { RefreshStatus } from '../../home/financiero/RefreshStatus'
import { useLiveData } from '../../home/financiero/useLiveData'
import { DetalleDedicaciones } from './DetalleDedicaciones'
import {
  EMPTY_MON_FILTERS,
  MonFilters,
  buildModel,
  monthLabel,
  projectLabel,
  recentWeeks,
  todayISO,
  weekLabel,
} from './model'
import { MensualPage, VistaMensual } from './pages/MensualPage'
import { SemanalPage } from './pages/SemanalPage'

type Tab = 'semanal' | 'mensual'
const TAB_STORAGE = 'dashboard-monitoreo-tab'

const readTab = (): Tab => {
  try {
    return localStorage.getItem(TAB_STORAGE) === 'mensual' ? 'mensual' : 'semanal'
  } catch {
    return 'semanal'
  }
}

/** Alterna un id en una lista: con Ctrl/Cmd suma o quita; sin él, selecciona solo ese */
const toggleId = (list: number[], id: number, multi: boolean) => {
  const has = list.includes(id)
  if (multi) return has ? list.filter((x) => x !== id) : [...list, id]
  return has && list.length === 1 ? [] : [id]
}

/** Dashboard de monitoreo de dedicación (reemplaza el reporte de Power BI "Monitoreo_Polaris") */
export function MonitoringDashboard() {
  const { data, error, loading, updatedAt, refresh } = useLiveData(getMonitoringDashboard)
  const model = useMemo(() => (data ? buildModel(data) : null), [data])

  const weeks = useMemo(() => recentWeeks(10), [])
  const [tab, setTab] = useState<Tab>(readTab)
  const [week, setWeek] = useState(weeks[0])
  const [month, setMonth] = useState(todayISO().slice(0, 7))
  const [view, setView] = useState<VistaMensual>('variacion')
  const [filters, setFilters] = useState<MonFilters>(EMPTY_MON_FILTERS)
  const [selUsers, setSelUsers] = useState<number[]>([])

  useEffect(() => {
    try {
      localStorage.setItem(TAB_STORAGE, tab)
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
  }, [tab])

  // Al cambiar de semana, mes o pestaña se limpia el proyecto elegido con clic;
  // el trabajador elegido se mantiene
  const clearSelections = useCallback(() => {
    setFilters((f) => (f.project.length ? { ...f, project: [] } : f))
  }, [])
  useEffect(clearSelections, [week, month, tab, view, clearSelections])

  const clearAll = () => {
    setFilters(EMPTY_MON_FILTERS)
    setSelUsers([])
  }

  const weekIdx = weeks.indexOf(week)
  const hasFilters = filters.user.length + filters.client.length + filters.project.length + selUsers.length > 0

  return (
    <div className="w-full mt-12 md:mt-0">
      <header className="bg-[#303031] text-white rounded-xl px-5 pt-4 pb-0 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Monitoreo de dedicación</h1>
            <p className="text-xs text-white/60 mt-0.5">
              Trabajadores activos. 100 % = la semana completa registrada.
            </p>
          </div>
          <RefreshStatus loading={loading} updatedAt={updatedAt} onRefresh={refresh} />
        </div>
        <nav className="flex flex-wrap gap-1 mt-4 -mb-px" role="tablist" aria-label="Vista del monitoreo">
          {(
            [
              ['semanal', 'Monitoreo semanal'],
              ['mensual', 'Monitoreo mensual'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CDEA80] ${
                tab === key ? 'border-[#CDEA80] text-white' : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 ring-1 ring-red-200 px-4 py-3 text-sm text-red-800 flex flex-wrap items-center justify-between gap-2"
        >
          <span>
            {data ? 'No se pudo actualizar; se muestran los últimos datos. ' : ''}
            {error}
          </span>
          <button type="button" onClick={refresh} className="font-semibold underline">
            Reintentar
          </button>
        </div>
      )}

      {!model && !error && <div className="py-24 text-center text-sm text-[#52514e]">Cargando monitoreo…</div>}

      {model && (
        <div className="bg-[#EDEBE5] rounded-xl p-3 md:p-4">
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {tab === 'semanal' ? (
              <div className="flex items-center gap-1" role="group" aria-label="Semana">
                <button
                  type="button"
                  onClick={() => weekIdx < weeks.length - 1 && setWeek(weeks[weekIdx + 1])}
                  disabled={weekIdx >= weeks.length - 1}
                  aria-label="Semana anterior"
                  className="h-9 w-9 rounded-lg bg-white ring-1 ring-black/15 text-xl leading-none text-[#C55A11] hover:ring-black/30 disabled:opacity-40"
                >
                  ‹
                </button>
                <select
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                  aria-label="Elegir semana"
                  className="h-9 pl-3 pr-8 text-sm font-medium rounded-lg border-0 ring-1 ring-[#C55A11] bg-[#C55A11] text-white focus:ring-2 focus:ring-[#CDEA80]"
                >
                  {weeks.map((w) => (
                    <option key={w} value={w} className="bg-white text-[#303031]">
                      {weekLabel(w)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => weekIdx > 0 && setWeek(weeks[weekIdx - 1])}
                  disabled={weekIdx <= 0}
                  aria-label="Semana siguiente"
                  className="h-9 w-9 rounded-lg bg-white ring-1 ring-black/15 text-xl leading-none text-[#C55A11] hover:ring-black/30 disabled:opacity-40"
                >
                  ›
                </button>
                {weekIdx !== 0 && (
                  <button
                    type="button"
                    onClick={() => setWeek(weeks[0])}
                    className="h-9 px-3 text-sm font-medium rounded-lg text-[#303031] hover:bg-black/5"
                  >
                    Semana actual
                  </button>
                )}
              </div>
            ) : (
              <>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  aria-label="Elegir mes"
                  className="h-9 pl-3 pr-8 text-sm font-medium rounded-lg border-0 ring-1 ring-black/15 bg-white text-[#303031] capitalize focus:ring-2 focus:ring-[#CDEA80]"
                >
                  <option value="all">Todos los meses</option>
                  {model.months.map((m) => (
                    <option key={m} value={m}>
                      {monthLabel(m)}
                    </option>
                  ))}
                </select>
                <div className="flex rounded-lg ring-1 ring-black/15 bg-white p-0.5" role="group" aria-label="Vista mensual">
                  {(
                    [
                      ['variacion', 'Variación mensual'],
                      ['ranking', 'Ranking mensual'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={view === key}
                      onClick={() => setView(key)}
                      className={`h-8 px-3 text-sm font-medium rounded-md transition-colors ${
                        view === key ? 'bg-[#FF735C] text-white' : 'text-[#303031] hover:bg-black/5'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <MultiSelect
              label="Trabajador"
              options={model.users.map((u) => ({ value: u.id, label: u.name }))}
              value={filters.user}
              onChange={(v) => setFilters((f) => ({ ...f, user: v as number[] }))}
              searchable
            />
            <MultiSelect
              label="Cliente"
              options={model.activeClients.map((id) => ({ value: id, label: model.clientNames.get(id) ?? '' }))}
              value={filters.client}
              onChange={(v) => setFilters((f) => ({ ...f, client: v as number[] }))}
              searchable
            />
            <button
              type="button"
              onClick={clearAll}
              disabled={!hasFilters}
              className="h-9 px-3 text-sm font-medium rounded-lg text-[#303031] hover:bg-black/5 disabled:text-[#898781] disabled:hover:bg-transparent"
            >
              Borrar filtros
            </button>
          </div>

          {/* Selecciones hechas con clic (no se ven en los filtros de arriba) */}
          {(filters.project.length > 0 || selUsers.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
              <span className="text-[#52514e]">Seleccionado con clic:</span>
              {filters.project.map((id) => (
                <Chip
                  key={`p${id}`}
                  label={projectLabel(model, id)}
                  onRemove={() => setFilters((f) => ({ ...f, project: f.project.filter((x) => x !== id) }))}
                />
              ))}
              {selUsers.map((id) => (
                <Chip
                  key={`u${id}`}
                  label={model.userNames.get(id) ?? ''}
                  onRemove={() => setSelUsers((s) => s.filter((x) => x !== id))}
                />
              ))}
            </div>
          )}

          <div className={`transition-opacity ${loading ? 'opacity-60' : 'opacity-100'}`}>
            {tab === 'semanal' ? (
              <SemanalPage
                model={model}
                week={week}
                filters={filters}
                selUsers={selUsers}
                onSelectProject={(id, multi) => setFilters((f) => ({ ...f, project: toggleId(f.project, id, multi) }))}
                onSelectUser={(id, multi) => setSelUsers((s) => toggleId(s, id, multi))}
              />
            ) : (
              <MensualPage
                model={model}
                month={month}
                view={view}
                filters={filters}
                selUsers={selUsers}
                onSelectClient={(id) => setFilters((f) => ({ ...f, client: id === null ? [] : [id], project: [] }))}
                onSelectProject={(id, multi) => setFilters((f) => ({ ...f, project: toggleId(f.project, id, multi) }))}
                onSelectUser={(id, multi) => setSelUsers((s) => toggleId(s, id, multi))}
              />
            )}
          </div>

          <DetalleDedicaciones
            model={model}
            periodo={tab === 'semanal' ? { type: 'week', week } : { type: 'month', month }}
            filters={filters}
            selUsers={selUsers}
            onSelectUser={(id) => setSelUsers((s) => toggleId(s, id, false))}
          />

          <p className="text-xs text-[#52514e] mt-4">
            Haz clic en un gráfico o en la tabla para filtrar; vuelve a hacer clic para quitarlo. Mantén Ctrl (o Cmd)
            para seleccionar varios. Las tarjetas siempre muestran a todo el equipo.
          </p>
        </div>
      )}
    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#303031] text-white pl-3 pr-1 py-0.5">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar ${label}`}
        className="w-5 h-5 rounded-full hover:bg-white/20 leading-none"
      >
        ×
      </button>
    </span>
  )
}
