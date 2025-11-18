// src/components/IncomeSectionEdit/IncomeSectionEdit.tsx (DESPUÉS)
// DESPUÉS
import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import { EditableFormSection } from '../EditableFormSection/EditableFormSection'
import { useIncomesRemoteDataset, Income } from '../../hooks/useIncomesRemoteDataset'
import { useOutlayCatalogs } from '../../hooks/useOutlayCatalogs'     // 👈 reutilizamos el mismo hook
import { getProjectLabel } from '../../utils/outlays/projectBucket'    // 👈 mismo label que usas en otras pantallas
import { getAllProjects } from '../../api/projects/get-projects'
import { IProject } from '../../interfaces/projects/projects.interface'

import { buildMonthOptions } from '../../utils/date/monthOptions'



export function IncomeSectionEdit() {
  // 🔐 token
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : ''
  // 🔗 dataset remoto (CRUD)
  const { records, upsert, remove, duplicate, create } = useIncomesRemoteDataset({ token })

  // 🔎 filtros/búsqueda
  const [query, setQuery] = useState('')
  const [filterTemporalityId, setFilterTemporalityId] = useState<number | ''>('')
  const [dateFrom, setDateFrom] = useState('') // YYYY-MM-DD
  const [dateTo, setDateTo] = useState('')     // YYYY-MM-DD

  // 🎯 selección
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true)

  useEffect(() => {
    if (selectedId == null) return
    if (records.length === 0) { setSelectedId(null); return }
    const still = records.some(r => r.id === selectedId)
    if (!still) setSelectedId(null)
  }, [records, selectedId])

  // 🧭 scroll y resaltado en pantallas chicas
  const editorRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!selectedId) return
    if (typeof window === 'undefined') return
    const is2XL = window.matchMedia?.('(min-width: 1536px)').matches
    if (is2XL) return
    const el = editorRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      el.classList.add('ring-2', 'ring-indigo-400', 'ring-offset-2', 'rounded-2xl')
      setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-400', 'ring-offset-2'), 1000)
    })
  }, [selectedId])

  // 📚 catálogos
// DESPUÉS: mismas temporalidades de Outlays + dataset de proyectos como en Outlays
  const { temporalityOptions } = useOutlayCatalogs(token) // 👈 solo temporalidades


  const [projects, setProjects] = useState<IProject[]>([])
    const projectsById = useMemo(() => {
    const map = new Map<number, string>()
    for (const p of projects) map.set(Number(p.id), getProjectLabel(p))
    return map
  }, [projects])

  useEffect(() => {
    if (!token) return
    getAllProjects(token, false)
      .then(data => setProjects(data?.projects || []))
      .catch(() => setProjects([]))
  }, [token])

  const cmp = (a: string, b: string) =>
    a.localeCompare(b, 'es', { sensitivity: 'base', ignorePunctuation: true })

  const projectOptions = useMemo(() => {
    const list = projects
      .slice()
      .sort((a, b) => cmp(getProjectLabel(a), getProjectLabel(b)))
      .map(p => ({ label: getProjectLabel(p), value: p.id }))
    return list
  }, [projects])

  // 🧂 normalizar texto
  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

  // 🧮 filtro + búsqueda
  const filtered = useMemo(() => {
     const base = records.filter(r => {
      if (filterTemporalityId !== '' && Number(r.temporalities_id) !== Number(filterTemporalityId)) return false
      if (dateFrom && r.date < dateFrom) return false
      if (dateTo   && r.date > dateTo)   return false
      return true
    })
    const q = normalize(query.trim())
    if (!q) return base
    return base.filter(r => {
      const proyecto = projectsById.get(r.project_id) ?? ''
      const haystack = [
        String(r.id), r.detail ?? '', r.date ?? '', String(r.amount ?? ''), proyecto,
      ].join(' | ')
      return normalize(haystack).includes(q)
    })
  }, [records, query, projectsById, filterTemporalityId, dateFrom, dateTo])

  // ✍️ registro seleccionado
  const selected = useMemo(
    () => records.find(r => r.id === selectedId) ?? null,
    [records, selectedId]
  )
  const monthOptions = useMemo(() => buildMonthOptions(0, 15), []) // este mes + 15 hacia adelante

  // 💾 persistencia con confirmación
  const handlePersist = useCallback(async (data: Income) => {
    // validación rápida en UI antes de preguntar
    const missing: string[] = []
    if (!data.temporalities_id) missing.push('Temporalidad')
    if (data.project_id == null) missing.push('Proyecto')
    if (!data.date) missing.push('Fecha')
    if (!data.detail?.trim()) missing.push('Detalle')

    if (missing.length) {
      await Swal.fire({ title: 'Campos obligatorios', text: `Completa: ${missing.join(', ')}`, icon: 'warning' })
      return
    }

    const res = await Swal.fire({
      title: '¿Guardar ingreso?',
      text: 'Se actualizará el registro seleccionado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    })
    if (!res.isConfirmed) return

    try {
      const savedId = await upsert(data)
      setSelectedId(savedId)
      await Swal.fire({ title: 'Guardado', icon: 'success', timer: 1500, showConfirmButton: false })
    } catch (e: any) {
      await Swal.fire({
        title: 'Error',
        html: `No se pudo guardar.<br/><small>${e?.message ?? 'Error inesperado (500?)'}</small>`,
        icon: 'error',
      })
    }
  }, [upsert])

  const confirm = (title: string, text: string, confirmText: string) =>
    Swal.fire({
      title, text, icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    })


  const safeGet = (map: Map<number, string>, id: number | null | undefined) =>
    id == null ? '—' : (map.get(id) ?? '—')


    // 🔢 columnas
  const columns = [
    { key: 'id',      label: 'ID' },
    { key: 'date',    label: 'Fecha' },
    { key: 'detail',  label: 'Detalle' },
    { key: 'amount',  label: 'Monto' },
    { key: 'project', label: 'Proyecto' },
  ] as const

  // 👇 NUEVO: control de scroll horizontal del contenedor de la tabla
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft]   = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollButtons = useCallback(() => {
    const el = tableScrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
  }, [])

  useEffect(() => { updateScrollButtons() }, [filtered, updateScrollButtons])

  useEffect(() => {
    const el = tableScrollRef.current
    if (!el) return
    const onScroll = () => updateScrollButtons()
    const onResize = () => updateScrollButtons()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [updateScrollButtons])

  const nudge = (dir: 'left' | 'right') => {
    const el = tableScrollRef.current
    if (!el) return
    const delta = Math.round(el.clientWidth * 0.8) * (dir === 'left' ? -1 : 1)
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  // 👇 callbacks usados en la tabla (los estabas llamando)
  const onEdit = (id: number) => setSelectedId(id)

  const onDuplicate = async (id: number) => {
    const res = await Swal.fire({
      title: '¿Duplicar ingreso?',
      text: 'Se creará una copia idéntica.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, duplicar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    })
    if (!res.isConfirmed) return
    await duplicate(id)
    Swal.fire({ title: 'Duplicado', icon: 'success', timer: 1200, showConfirmButton: false })
  }

  const onDelete = async (id: number) => {
    const res = await Swal.fire({
      title: '¿Eliminar?',
      text: 'Esta acción eliminará el registro de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    })
    if (!res.isConfirmed) return
    await remove(id)
    if (id === selectedId) setSelectedId(null)
    Swal.fire({ title: 'Eliminado', icon: 'success', timer: 1200, showConfirmButton: false })
  }


    return (
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 mt-8">
        <div className="grid gap-6 2xl:grid-cols-[minmax(20rem,1.2fr)_minmax(24rem,2fr)]">

        {/* LISTA + filtros */}
        {/* LISTA + filtros */}
        <div className="bg-white border rounded-2xl shadow-sm p-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
            <input
              placeholder="Buscar por monto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:flex-1 border rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              onClick={async () => setSelectedId(await create())}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border bg-[#3E3378] text-white hover:bg-[#89CCDC] hover:text-black"
            >
              Nuevo
            </button>
          </div>

          {/* Filtros: Temporalidad + Fecha */}
          {/* Filtros: con etiqueta clara */}
          <div className="flex flex-wrap items-end gap-3 mb-3">
            <div className="flex flex-col">
              <label htmlFor="flt-temporalidad" className="text-xs text-gray-600 mb-1">Temporalidad</label>
              <select
                id="flt-temporalidad"
                value={filterTemporalityId}
                onChange={(e) => setFilterTemporalityId(e.target.value === '' ? '' : Number(e.target.value))}
                className="border rounded-xl p-2"
                title="Filtra por la temporalidad del ingreso"
                aria-label="Filtro de temporalidad"
              >
                <option value="">Todas</option>
                {temporalityOptions.map(op => (
                  <option key={String(op.value)} value={String(op.value)}>{op.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="flt-desde" className="text-xs text-gray-600 mb-1">Fecha desde</label>
              <input
                id="flt-desde"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border rounded-xl p-2"
                placeholder="YYYY-MM-DD"
                title="Mostrar registros con fecha mayor o igual a esta"
                aria-label="Fecha desde"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="flt-hasta" className="text-xs text-gray-600 mb-1">Fecha hasta</label>
              <input
                id="flt-hasta"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border rounded-xl p-2"
                placeholder="YYYY-MM-DD"
                title="Mostrar registros con fecha menor o igual a esta"
                aria-label="Fecha hasta"
              />
            </div>

            <button
              type="button"
              onClick={() => { setFilterTemporalityId(''); setDateFrom(''); setDateTo(''); }}
              className="px-3 py-2 rounded-xl border"
              title="Borrar filtros aplicados"
            >
              Limpiar Filtros
            </button>
          </div>

          {/* vista lista (mobile) */}
          {/* vista lista (mobile) */}
          <div className="md:hidden space-y-2">
            {filtered.map(row => (
              <div key={row.id} className={`border rounded-xl p-3 ${row.id === selectedId ? 'bg-indigo-50/40' : 'bg-white'} overflow-hidden`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-gray-500">ID</span>
                  <span className="font-medium tabular-nums">{row.id < 0 ? 'Nuevo' : row.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <div className="text-xs text-gray-500">Fecha</div>
                    <div className="tabular-nums">{row.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Monto</div>
                    <div className="font-medium tabular-nums">${Number(row.amount ?? 0).toFixed(0)}</div>
                  </div>
                </div>
                <div className="mt-2 min-w-0">
                  <div className="text-xs text-gray-500">Detalle</div>
                  <div className="line-clamp-2 break-words">{row.detail}</div>
                </div>
                <div className="mt-3 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Proyecto</div>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg break-words line-clamp-2">
                    {safeGet(projectsById, row.project_id)}
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-3 flex-wrap">
                  <button className="underline text-indigo-700" onClick={() => setSelectedId(row.id)}>Editar</button>
                  <button
                    className="underline"
                    onClick={async () => {
                      const res = await confirm('¿Duplicar ingreso?', 'Se creará una copia idéntica.', 'Sí, duplicar')
                      if (!res.isConfirmed) return
                      await duplicate(row.id)
                      Swal.fire({ title: 'Duplicado', icon: 'success', timer: 1200, showConfirmButton: false })
                    }}
                  >Duplicar</button>
                  <button className="underline text-red-600" onClick={async () => {
                    const res = await Swal.fire({ title:'¿Eliminar?', text: 'Esta acción eliminará el registro de forma permanente.', icon:'warning', showCancelButton:true, confirmButtonText:'Sí, eliminar', cancelButtonText:'Cancelar', reverseButtons:true, focusCancel:true })
                    if (!res.isConfirmed) return
                    await remove(row.id)
                    if (row.id === selectedId) setSelectedId(null)
                    Swal.fire({ title:'Eliminado', icon:'success', timer:1200, showConfirmButton:false })
                  }}>Eliminar</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (<div className="px-3 py-6 text-center text-gray-500 border rounded-xl">Sin resultados</div>)}
          </div>

          {/* tabla (md+) */}
          {/* tabla (md+) */}
          {/* tabla (md+) con header sticky y scroll vertical */}
          <div
            ref={tableScrollRef}
            className="hidden md:block relative overflow-x-auto overflow-y-auto border rounded-xl max-h-[65vh]"
          >
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent rounded-tr-xl rounded-br-xl -z-10" />
            <table className="w-full text-sm">

              <thead className="bg-gray-50 sticky top-0 z-30 shadow">
                <tr>
                  {columns.map(c => (
                    <th
                      key={String(c.key)}
                      className="text-left px-3 py-2 font-medium text-gray-700 whitespace-nowrap"
                    >
                      {c.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-right whitespace-nowrap sticky right-0 z-20 bg-white border-l">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(row => (
                  <tr key={row.id} className={`border-t ${row.id === selectedId ? 'bg-indigo-50/40' : 'bg-white'}`}>
                    <td className="px-3 py-2 tabular-nums">{row.id < 0 ? 'Nuevo' : row.id}</td>
                    <td className="px-3 py-2 tabular-nums whitespace-nowrap">{row.date}</td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="line-clamp-1">{row.detail}</span></td>
                    <td className="px-3 py-2 tabular-nums whitespace-nowrap">${Number(row.amount ?? 0).toFixed(0)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{safeGet(projectsById, row.project_id)}</td>
                      <td className="px-3 py-2 sticky right-0 z-10 bg-white border-l">
                        <div className="flex gap-3 justify-end">
                          <button className="underline text-indigo-700" onClick={() => onEdit(row.id)} title="Editar">Editar</button>
                          <button className="underline" onClick={() => onDuplicate(row.id)} title="Duplicar">Duplicar</button>
                          <button className="underline text-red-600" onClick={() => onDelete(row.id)} title="Eliminar">Eliminar</button>
                        </div>
                      </td>

                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={columns.length + 1}>Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>

       
        </div>

        {/* PANEL DE EDICIÓN */}
        <div ref={editorRef} className="scroll-mt-4 sm:scroll-mt-6">
          {selected ? (
            <EditableFormSection<Income>
                title={`Editar ingreso #${selected.id < 0 ? '—nuevo—' : selected.id}`}
                storageKey={`incomes:${selected.id}`}
                seed={selected}
                onPersist={handlePersist}
                // 👇 sincroniza month ↔ date (YYYY-MM ↔ YYYY-MM-01)
                onChange={(draft, name, value) => {
                  if (name === 'date') {
                    const raw = String(value || '')
                    const ym = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw.slice(0,7)
                            : /^\d{4}-\d{2}$/.test(raw) ? raw
                            : ''
                    // mantenemos 'month' en el draft aunque no se muestre
                    return { ...draft, date: ym ? `${ym}-01` : '', month: ym || '' } as Income
                  }
                }}

                fields={[
                  { type: 'number', name: 'id', label: 'ID', required: true, readonly: true },
                  { type: 'money',  name: 'amount', label: 'Monto', required: true, addon: { suffix: 'CLP' } },

                  { type: 'date',   name: 'date', label: 'Fecha', required: true, firstOfMonthOnly: true,
                    help: 'Se guarda como el día 01 del mes seleccionado.' },

                  { type: 'textarea', name: 'detail', label: 'Detalle', required: true, colSpan: 2, rows: 6, placeholder: 'Ej: Servicios, contrato, etc.' },
                  { type: 'select', name: 'temporalities_id', label: 'Temporalidad', required: true, options: temporalityOptions },
                  { type: 'select', name: 'project_id', label: 'Proyecto', required: true, options: projectOptions },

                ]}
                
              />
          ) : (
            <div className="bg-white border rounded-2xl shadow-sm p-6 flex items-center justify-center text-gray-600">
              Selecciona un registro para editar o crea uno nuevo.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
