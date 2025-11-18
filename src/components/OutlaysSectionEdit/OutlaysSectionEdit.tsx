import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { EditableFormSection } from '../EditableFormSection/EditableFormSection'
import { useOutlaysRemoteDataset, Outlay } from '../../hooks/useOutlaysRemoteDataset'
import { useOutlayCatalogs } from '../../hooks/useOutlayCatalogs'
import { buildProjectOptGroups } from '../../utils/outlays/projectBucket'
import { getAllProjects } from '../../api/projects/get-projects'             // 👈 carga dataset
import { IProject } from '../../interfaces/projects/projects.interface'      // 👈 tipo

import Swal from 'sweetalert2'

export function OutlaysSectionEdit() {
   
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : ''
  const { records, upsert, remove, duplicate, create } = useOutlaysRemoteDataset({ token })

  // OutlaysSectionEdit.tsx (fragmento)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const [projects, setProjects] = useState<IProject[]>([])
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [filterTemporalityId, setFilterTemporalityId] = useState<number | ''>('');
  const [dateFrom, setDateFrom] = useState(''); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState('');     // YYYY-MM-DD

  // Cuando records cambian, asegura un seleccionado válido
    useEffect(() => {
      if (selectedId == null) return // 👈 no autoseleccionar al entrar
      if (records.length === 0) {
        setSelectedId(null)
        return
      }
      const stillExists = records.some(r => r.id === selectedId)
      if (!stillExists) setSelectedId(null)
    }, [records, selectedId])


    useEffect(() => {
    if (!token) return
    getAllProjects(token, false)
      .then(data => setProjects(data?.projects || []))
      .catch(() => setProjects([]))
  }, [token])


  const editorRef = useRef<HTMLDivElement>(null)

 

  useEffect(() => {
    if (!selectedId) return
    if (typeof window === 'undefined') return
    const is2XLOrBigger = window.matchMedia?.('(min-width: 1536px)').matches
    if (is2XLOrBigger) return

    const el = editorRef.current
    if (!el) return


    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })


      el.classList.add('ring-2', 'ring-indigo-400', 'ring-offset-2', 'rounded-2xl')
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-indigo-400', 'ring-offset-2')
      }, 1000)
    })
  }, [selectedId])


  const selected = useMemo(
    () => records.find(r => r.id === selectedId) ?? null,
    [records, selectedId]
  )

  // debajo de selected:
  const [typeDraft, setTypeDraft] = useState<number>(Number(selected?.outlay_types_id ?? 0))

  useEffect(() => {
    setTypeDraft(Number(selected?.outlay_types_id ?? 0))
  }, [selected?.id]) // o [selected]

// ⬆️ junto a otros imports

  // ⬇️ cerca de tus useMemo de proyectos
  const projectOptionsGrouped = useMemo(() => {
    const groups = buildProjectOptGroups(projects, showActiveOnly)
    const sep = (label: string) => ({ label: `── ${label} ──`, value: `#sep#${label}` })
    return groups.flatMap(g => [sep(g.label), ...g.options])
  }, [projects, showActiveOnly])

  const {
    categoriesById,
    projectsById,
    temporalityOptions,
    typeOptions,
    categoryOptions,
    
  } = useOutlayCatalogs(token)



  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '') 

  const filtered = useMemo(() => {
    // 1) Filtra por temporalidad y rango de fechas (inclusive)
    let base = records.filter(r => {
      if (filterTemporalityId !== '' && r.outlay_temporalities_id !== Number(filterTemporalityId)) return false;
      if (dateFrom && r.date < dateFrom) return false; // r.date es 'YYYY-MM-DD'
      if (dateTo   && r.date > dateTo)   return false;
      return true;
    });

    // 2) Búsqueda por texto (igual que antes)
    const q = normalize(query.trim());
    if (!q) return base;

    return base.filter(r => {
      const categoria = categoriesById.get(r.outlay_category_id) ?? '';
      const proyecto  = projectsById.get(r.project_id) ?? '';
      const haystack = [
        String(r.id),
        r.detail ?? '',
        r.date ?? '',
        String(r.amount ?? ''),
        categoria,
        proyecto,
      ].join(' | ');
      return normalize(haystack).includes(q);
    });
  }, [
    records, query, categoriesById, projectsById,
    filterTemporalityId, dateFrom, dateTo
  ]);


  const handlePersist = async (data: Outlay) => {
    const result = await Swal.fire({
      title: '¿Guardar versión?',
      text: 'Esta acción actualizará el registro seleccionado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    })
    if (!result.isConfirmed) return

    try {
      const savedId = await upsert(data)   // 👈 upsert devuelve el id (nuevo o existente)
      setSelectedId(savedId)               // 👈 mueve el panel al ID real

      await Swal.fire({
        title: 'Guardado',
        text: 'Los cambios se guardaron correctamente.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (err: any) {
      await Swal.fire({
        title: 'Error',
        text: err?.message ?? 'No se pudo guardar. Intenta nuevamente.',
        icon: 'error',
      })
    }
  }

  const isDirect = Number(typeDraft) === 1

  const fieldsForOutlay = useMemo(() => {
    const base = [
      { type: 'number', name: 'id', label: 'ID', required: true, readonly: true },
      { type: 'money',  name: 'amount', label: 'Monto', required: true, addon: { suffix: 'CLP' } },
      { type: 'date',   name: 'date', label: 'Fecha', required: true, firstOfMonthOnly: true },

      { type: 'textarea', name: 'detail', label: 'Detalle', required: true, colSpan: 2,
        rows: 6, placeholder: 'Ej: Gastos Oficina, Caja chica, Arriendo.' },

      { type: 'select', name: 'outlay_temporalities_id', label: 'Temporalidad', required: true,
        options: temporalityOptions },
      { type: 'select', name: 'outlay_types_id', label: 'Tipo', required: true,
        options: typeOptions },
    ] as const

    if (isDirect) {
      return [
        ...base,
        { type: 'select', name: 'project_id', label: 'Proyecto', required: true,
          options: projectOptionsGrouped },        // 👈 usa agrupadas con separadores
      ] as any
    }
    return [
      ...base,
      { type: 'select', name: 'outlay_category_id', label: 'Categoría', required: true,
        options: categoryOptions },
    ] as any
  }, [isDirect, temporalityOptions, typeOptions, categoryOptions, projectOptionsGrouped])

  // 👇 limpia el otro campo cuando cambias Directo/Indirecto
  const handleFormChange = useCallback((draft: Outlay, name: string, value: unknown) => {
    if (name === 'outlay_types_id') {
      const v = Number(value)
      setTypeDraft(v) // fuerza re-render de fields
      const nowDirect = v === 1
      if (nowDirect) draft.outlay_category_id = null as unknown as number
      else           draft.project_id         = null as unknown as number
      return draft
    }
  }, [])


  // 👇 header para integrarse dentro de EditableFormSection (sólo Outlays Directo)
  const headerForOutlays = isDirect ? (
    <div className="mb-2 flex items-center justify-start gap-3">
      <span className="text-xs text-gray-600">Mostrando Proyectos por Estado:</span>
      <span className="text-xs text-gray-600">Inactivos</span>
      <button
        type="button"
        role="switch"
        aria-checked={showActiveOnly}
        onClick={() => setShowActiveOnly(v => !v)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200
          ${showActiveOnly ? 'bg-indigo-600' : 'bg-gray-300'}`}
        title={showActiveOnly ? 'Mostrando Activos' : 'Mostrando Inactivos'}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200
            ${showActiveOnly ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
      <span className="text-xs text-gray-600">Activos</span>
    </div>
  ) : null

  const safeGet = (map: Map<number, string>, id: number | null | undefined) =>
  id == null ? '—' : (map.get(id) ?? '—')


    // Confirmar y DUPLICAR sin mover la selección
  const handleDuplicate = useCallback(async (id: number) => {
    const res = await Swal.fire({
      title: '¿Duplicar registro?',
      text: 'Se creará una copia del registro seleccionado.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, duplicar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    })
    if (!res.isConfirmed) return

    try {
      await duplicate(id) // 👈 NO tocamos selectedId => no hay scroll ni cambio de panel
      await Swal.fire({
        title: 'Duplicado',
        text: 'Se creó una copia del registro.',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
      })
      // La tabla se refresca porque `records` cambia dentro del hook
    } catch (e: any) {
      await Swal.fire({
        title: 'Error',
        text: e?.message ?? 'No se pudo duplicar el registro.',
        icon: 'error',
      })
    }
  }, [duplicate])

  // Confirmar y ELIMINAR
  const handleDelete = useCallback(async (id: number) => {
    const res = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción eliminará el registro de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    })
    if (!res.isConfirmed) return

    try {
      await remove(id)
      if (id === selectedId) setSelectedId(null)
      await Swal.fire({
        title: 'Eliminado',
        text: 'El registro fue eliminado correctamente.',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
      })
    } catch (e: any) {
      await Swal.fire({
        title: 'Error',
        text: e?.message ?? 'No se pudo eliminar el registro.',
        icon: 'error',
      })
    }
  }, [remove, selectedId])


  // ...
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'date', label: 'Fecha' },
    { key: 'detail', label: 'Detalle' },
    { key: 'amount', label: 'Monto' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'proyecto', label: 'Proyecto' },
  ] as const

  // 👇 NUEVO: control de scroll horizontal del contenedor de la tabla
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
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


  return (
    <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 mt-8">
    <div className="grid gap-6 2xl:[grid-template-columns:minmax(20rem,1.2fr)_minmax(24rem,2fr)]">

      <div className="bg-white border rounded-2xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
            <input
              placeholder="Buscar por..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:flex-1 border rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              onClick={async() => setSelectedId(await create())}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border bg-[#3E3378] text-white hover:bg-[#89CCDC] hover:text-black"

            >
              Nuevo
            </button>
          </div>
        {/* Filtros: Temporalidad y Fecha */}
        {/* Filtros: claros con etiqueta */}
        <div className="flex flex-wrap items-end gap-3 mb-3">
          {/* Temporalidad */}
          <div className="flex flex-col">
            <label htmlFor="flt-temporalidad" className="text-xs text-gray-600 mb-1">
              Temporalidad
            </label>
            <select
              id="flt-temporalidad"
              value={filterTemporalityId}
              onChange={(e) => setFilterTemporalityId(e.target.value === '' ? '' : Number(e.target.value))}
              className="border rounded-xl p-2"
              title="Filtra por la temporalidad del desembolso"
              aria-label="Filtro de temporalidad"
            >
              <option value="">Todas</option>
              {temporalityOptions.map(op => (
                <option key={String(op.value)} value={String(op.value)}>{op.label}</option>
              ))}
            </select>
          </div>

          {/* Fecha desde */}
          <div className="flex flex-col">
            <label htmlFor="flt-desde" className="text-xs text-gray-600 mb-1">
              Fecha desde
            </label>
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

          {/* Fecha hasta */}
          <div className="flex flex-col">
            <label htmlFor="flt-hasta" className="text-xs text-gray-600 mb-1">
              Fecha hasta
            </label>
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

        {/* vista lista */}
        <div className="md:hidden space-y-2">
          {filtered.map(row => (
            <div
              key={row.id}
              className={`border rounded-xl p-3 ${row.id === selectedId ? 'bg-indigo-50/40' : 'bg-white'}`}
            >
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
                  <div className="font-medium tabular-nums">
                    ${Number(row.amount ?? 0).toFixed()}

                  </div>
                </div>
              </div>

              <div className="mt-2">
                <div className="text-xs text-gray-500">Detalle</div>
                <div className="line-clamp-2">{row.detail}</div>
              </div>

            
              <div className="mt-3 space-y-2">
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Categoría</div>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg break-words">
                    {safeGet(categoriesById, row.outlay_category_id)}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Proyecto</div>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg break-words">
                    {safeGet(projectsById, row.project_id)}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-3">
                <button
                  className="underline text-indigo-700"
                  onClick={() => setSelectedId(row.id)}
                  aria-label={`Editar desembolso ${row.id}`}
                  title="Editar (abre el panel de la derecha)"
                >
                  Editar
                </button>
                  <button
                    className="underline"
                    onClick={() => handleDuplicate(row.id)}   // 👈 confirmar y NO cambiar selección
                  >
                    Duplicar
                  </button>

                  <button
                    className="underline text-red-600"
                    onClick={() => handleDelete(row.id)}      // 👈 confirmar y eliminar
                  >
                    Eliminar
                  </button>

              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-6 text-center text-gray-500 border rounded-xl">Sin resultados</div>
          )}
        </div>


        {/* tabla formato md */}
          <div
            ref={tableScrollRef}
            className="hidden md:block relative overflow-x-auto overflow-y-auto border rounded-xl max-h-[65vh]"
          >
            {/* pista de scroll horizontal (opcional) */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent rounded-tr-xl rounded-br-xl -z-10" />
            <table className="w-full text-sm">


            <thead className="bg-gray-50 sticky top-0 z-30 shadow">

              <tr>
                {columns.map(c => (
                  <th
                    key={c.key as string}
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
                <tr
                  key={row.id}
                  className={`border-t ${row.id === selectedId ? 'bg-indigo-50/40' : 'bg-white'}`}
                >
                  <td className="px-3 py-2 tabular-nums">{row.id < 0 ? 'Nuevo' : row.id}</td>
                  <td className="px-3 py-2 tabular-nums whitespace-nowrap">{row.date}</td>
                  <td className="px-3 py-2">
                    <span className="line-clamp-1">{row.detail}</span>
                  </td>
                  <td className="px-3 py-2 tabular-nums whitespace-nowrap">
                    ${Number(row.amount ?? 0).toFixed(0)}

                  </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {safeGet(categoriesById, row.outlay_category_id)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {safeGet(projectsById, row.project_id)}
                    </td>
                        <td
                          className="px-3 py-2 sticky right-0 z-10 bg-white border-l"
                        >
                          <div className="flex gap-3 justify-end">
                            <button
                              className="underline text-indigo-700"
                              onClick={() => setSelectedId(row.id)}
                              aria-label={`Editar ${row.id}`}
                              title="Editar"
                            >
                              Editar
                            </button>
                            <button
                              className="underline"
                              onClick={() => handleDuplicate(row.id)}
                              title="Duplicar"
                            >
                              Duplicar
                            </button>
                            <button
                              className="underline text-red-600"
                              onClick={() => handleDelete(row.id)}
                              title="Eliminar"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>

                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-gray-500" colSpan={columns.length + 1}>
                    Sin resultados
                  </td>
                </tr>
              )}
 
            </tbody>
          </table>
        </div>

      </div>

      {/* PANEL DE EDICIÓN */}
      <div ref={editorRef} className="scroll-mt-4 sm:scroll-mt-6">
      {selected ? (
      <EditableFormSection<Outlay>
          title={`Editar desembolso #${selected.id < 0 ? '—nuevo—' : selected.id}`}
          storageKey={`outlays:${selected.id}`}
          seed={selected as Outlay}
          onPersist={handlePersist}
          onChange={handleFormChange}
          fields={fieldsForOutlay}
          header={headerForOutlays}          // 👈 ahora el switch vive dentro del componente
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
