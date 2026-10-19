import { useEffect, useMemo, useRef, useState } from 'react'
import { Dim, Filters, Model, hasFilters, periodRange } from './model'
import { MONTH_NAMES, periodLabel } from './theme'

export interface Option {
  value: string | number
  label: string
}

interface Props {
  model: Model
  filters: Filters
  onChange: (dim: Dim, values: (string | number)[]) => void
  onClear: () => void
}

/** Segmentadores del reporte: Año, Mes, Proyecto, Tipo y Cliente */
export function FilterBar({ model, filters, onChange, onClear }: Props) {
  const options = useMemo(() => {
    const byName = (a: Option, b: Option) => a.label.localeCompare(b.label, 'es')
    const projects = [...model.projects.values()]
    return {
      year: model.years.map((y) => ({ value: y, label: String(y) })),
      month: MONTH_NAMES.map((m, i) => ({ value: i + 1, label: m })),
      project: projects.map((p) => ({ value: p.id, label: p.name })).sort(byName),
      type: [...model.typeNames].map(([id, name]) => ({ value: id, label: name })).sort(byName),
      client: [...model.clientNames].map(([id, name]) => ({ value: id, label: name })).sort(byName),
    }
  }, [model])

  const periodOptions = useMemo(() => {
    const { start, end } = model.calendar
    if (!start || !end) return []
    return periodRange([start.slice(0, 7), end.slice(0, 7)]).map((p) => ({
      value: p,
      label: periodLabel(p),
    }))
  }, [model])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <MultiSelect label="Año" options={options.year} value={filters.year} onChange={(v) => onChange('year', v)} />
      <MultiSelect label="Mes" options={options.month} value={filters.month} onChange={(v) => onChange('month', v)} />
      {filters.period.length > 0 && (
        <MultiSelect
          label="Periodo"
          options={periodOptions}
          value={filters.period}
          onChange={(v) => onChange('period', v)}
        />
      )}
      <MultiSelect label="Proyecto" options={options.project} value={filters.project} onChange={(v) => onChange('project', v)} searchable />
      <MultiSelect label="Tipo" options={options.type} value={filters.type} onChange={(v) => onChange('type', v)} />
      <MultiSelect label="Cliente" options={options.client} value={filters.client} onChange={(v) => onChange('client', v)} searchable />

      <button
        type="button"
        onClick={onClear}
        disabled={!hasFilters(filters)}
        className="h-9 px-3 text-sm font-medium rounded-lg text-[#303031] hover:bg-black/5 disabled:text-[#898781] disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CDEA80]"
      >
        Borrar segmentaciones
      </button>
    </div>
  )
}

export interface MultiSelectProps {
  label: string
  options: Option[]
  value: (string | number)[]
  onChange: (v: (string | number)[]) => void
  searchable?: boolean
}

export function MultiSelect({ label, options, value, onChange, searchable = false }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  const selected = new Set(value)
  const visible = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  const summary =
    value.length === 0
      ? 'Todos'
      : value.length === 1
        ? options.find((o) => o.value === value[0])?.label ?? '1 seleccionado'
        : `${value.length} seleccionados`

  const toggle = (v: string | number) =>
    onChange(selected.has(v) ? value.filter((x) => x !== v) : [...value, v])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`h-9 pl-3 pr-2 flex items-center gap-2 rounded-lg text-sm ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CDEA80] ${
          value.length > 0
            ? 'bg-[#303031] text-white ring-[#303031]'
            : 'bg-white text-[#303031] ring-black/15 hover:ring-black/30'
        }`}
      >
        <span className={value.length > 0 ? 'text-white/70' : 'text-[#898781]'}>{label}:</span>
        <span className="font-medium max-w-[160px] truncate">{summary}</span>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg ring-1 ring-black/10 p-1">
          {searchable && (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="w-full mb-1 h-8 px-2 text-sm rounded-md border-0 ring-1 ring-black/10 focus:ring-2 focus:ring-[#CDEA80]"
            />
          )}
          <ul className="max-h-64 overflow-auto" role="listbox" aria-multiselectable="true">
            {visible.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected.has(o.value)}
                  onClick={() => toggle(o.value)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left rounded-md hover:bg-black/5"
                >
                  <span className="w-4 shrink-0 text-[#303031] font-bold">
                    {selected.has(o.value) ? '✓' : ''}
                  </span>
                  <span className="truncate">{o.label}</span>
                </button>
              </li>
            ))}
            {visible.length === 0 && (
              <li className="px-2 py-2 text-sm text-[#898781]">Sin resultados</li>
            )}
          </ul>
          {value.length > 0 && (
            <div className="border-t border-black/10 mt-1 pt-1">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full px-2 py-1.5 text-sm text-left rounded-md text-[#52514e] hover:bg-black/5"
              >
                Limpiar selección
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
