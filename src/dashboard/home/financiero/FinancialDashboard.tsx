import { useCallback, useEffect, useMemo, useState } from 'react'
import { Dim, EMPTY_FILTERS, Filters, buildModel } from './model'
import { FilterBar } from './FilterBar'
import { useFinancialData } from './useFinancialData'
import { RefreshStatus } from './RefreshStatus'
import { fmt } from './theme'
import { ResumenPage } from './pages/ResumenPage'
import { UtilidadesPage } from './pages/UtilidadesPage'
import { IngresosPage } from './pages/IngresosPage'
import { CostosPage } from './pages/CostosPage'
import { ClientesPage } from './pages/ClientesPage'

const TABS = [
  { key: 'resumen', label: 'Resumen', Page: ResumenPage },
  { key: 'utilidades', label: 'Utilidades', Page: UtilidadesPage },
  { key: 'ingresos', label: 'Ingresos', Page: IngresosPage },
  { key: 'costos', label: 'Costos', Page: CostosPage },
  { key: 'clientes', label: 'Clientes', Page: ClientesPage },
] as const

type TabKey = (typeof TABS)[number]['key']
const TAB_STORAGE = 'dashboard-financiero-tab'

const readTab = (): TabKey => {
  try {
    const t = localStorage.getItem(TAB_STORAGE)
    return TABS.some((x) => x.key === t) ? (t as TabKey) : 'resumen'
  } catch {
    return 'resumen'
  }
}

/** Dashboard financiero (reemplaza el reporte de Power BI "Polux Polaris") */
export function FinancialDashboard() {
  const { data, error, loading, updatedAt, refresh } = useFinancialData()
  const [tab, setTab] = useState<TabKey>(readTab)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)

  const model = useMemo(() => (data ? buildModel(data) : null), [data])

  useEffect(() => {
    try {
      localStorage.setItem(TAB_STORAGE, tab)
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
  }, [tab])

  const setDim = useCallback((dim: Dim, values: (string | number)[]) => {
    setFilters((f) => ({ ...f, [dim]: values }))
  }, [])

  // Clic en un gráfico: selecciona ese valor; un segundo clic lo quita.
  // Con Ctrl/Cmd se suman varios valores, como en Power BI.
  const select = useCallback((dim: Dim, key: string | number, multi: boolean) => {
    setFilters((f) => {
      const current = f[dim]
      const has = current.includes(key)
      let next: (string | number)[]
      if (multi) next = has ? current.filter((v) => v !== key) : [...current, key]
      else next = has && current.length === 1 ? [] : [key]
      return { ...f, [dim]: next }
    })
  }, [])

  const Page = TABS.find((t) => t.key === tab)!.Page

  return (
    <div className="w-full mt-12 md:mt-0">
      <header className="bg-[#303031] text-white rounded-xl px-5 pt-4 pb-0 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Resumen financiero</h1>
            <p className="text-xs text-white/60 mt-0.5">
              Montos en pesos. Utilidad y costos convertidos con la UF del día
              {data ? ` (${fmt.uf(data.uf.value)})` : ''}.
            </p>
            {data?.uf.fallback && (
              <p className="text-xs text-[#CDEA80] mt-1">
                No se pudo obtener la UF de hoy: se usa la última registrada
                {data.uf.date ? ` (${data.uf.date.split('-').reverse().join('-')})` : ''}.
              </p>
            )}
          </div>
          <RefreshStatus loading={loading} updatedAt={updatedAt} onRefresh={refresh} />
        </div>

        <nav className="flex flex-wrap gap-1 mt-4 -mb-px" role="tablist" aria-label="Secciones del dashboard">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CDEA80] rounded-t-md ${
                tab === t.key
                  ? 'border-[#CDEA80] text-white'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              {t.label}
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

      {!model && !error && (
        <div className="py-24 text-center text-sm text-[#52514e]">Cargando dashboard…</div>
      )}

      {model && (
        // Fondo de página del reporte de Power BI
        <div className="bg-[#EDEBE5] rounded-xl p-3 md:p-4">
          <div className="mb-4">
            <FilterBar
              model={model}
              filters={filters}
              onChange={setDim}
              onClear={() => setFilters(EMPTY_FILTERS)}
            />
          </div>
          {/* Al recargar se mantiene el gráfico anterior atenuado: sin saltos ni parpadeo */}
          <div className={`transition-opacity ${loading ? 'opacity-60' : 'opacity-100'}`}>
            <Page model={model} filters={filters} select={select} />
          </div>
          <p className="text-xs text-[#52514e] mt-4">
            Haz clic en un gráfico para filtrar los demás; vuelve a hacer clic para quitar el filtro.
            Mantén Ctrl (o Cmd) para seleccionar varios.
          </p>
        </div>
      )}
    </div>
  )
}
