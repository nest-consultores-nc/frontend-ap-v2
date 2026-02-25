import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { EditableFormSection } from '../EditableFormSection/EditableFormSection'
import { useOutlaysRemoteDataset, Outlay } from '../../hooks/useOutlaysRemoteDataset'
import { useOutlayCatalogs } from '../../hooks/useOutlayCatalogs'
import { buildProjectOptGroups } from '../../utils/outlays/projectBucket'
import { getAllProjects } from '../../api/projects/get-projects'             
import { IProject } from '../../interfaces/projects/projects.interface'   

import Swal from 'sweetalert2'

export function OutlaysSectionEdit() {
   
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : ''
  const { records, upsert, remove, duplicate, create } = useOutlaysRemoteDataset({ token })

  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [projects, setProjects] = useState<IProject[]>([])
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [filterCategoryId, setFilterCategoryId] = useState<number | ''>('');
  const [filterProjectId, setFilterProjectId] = useState<number | ''>('');
  const [filterMonth, setFilterMonth] = useState(''); 

 
    useEffect(() => {
      if (selectedId == null) return
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


  const [typeDraft, setTypeDraft] = useState<number>(Number(selected?.outlay_types_id ?? 0))

  useEffect(() => {
    setTypeDraft(Number(selected?.outlay_types_id ?? 0))
  }, [selected?.id]) 

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


  const uniqueCategories = useMemo(() => {
    
    const categoryIdsInRecords = new Set(
      records
        .map(r => r.outlay_category_id)
        .filter((id): id is number => id != null)
    );

    const cats = Array.from(categoriesById.entries())
      .filter(([id]) => categoryIdsInRecords.has(id))
      .map(([id, name]) => ({ value: id, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return cats;
  }, [categoriesById, records]);

  const uniqueProjects = useMemo(() => {
  
    const projectIdsInRecords = new Set(
      records
        .map(r => r.project_id)
        .filter((id): id is number => id != null)
    );

 
    const projectsInUse = projects.filter(p => projectIdsInRecords.has(p.id));

    const projectsWithClient = projectsInUse.map(p => ({
      id: p.id,
      label: p.client?.clientName 
        ? `${p.client.clientName} - ${p.project_name}`
        : p.project_name
    }));

    return projectsWithClient
      .map(p => ({ value: p.id, label: p.label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [projects, records]);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '') 

  const getProjectLabel = (projectId: number | null | undefined): string => {
    if (projectId == null) return '—';
    const project = projects.find(p => p.id === projectId);
    if (!project) return projectsById.get(projectId) ?? '—';
    
    return project.client?.clientName 
      ? `${project.client.clientName} - ${project.project_name}`
      : project.project_name;
  };

  const filtered = useMemo(() => {
    
    let base = records.filter(r => {
    
      if (filterCategoryId !== '' && r.outlay_category_id !== Number(filterCategoryId)) return false;
      
      if (filterProjectId !== '' && r.project_id !== Number(filterProjectId)) return false;
      
      if (filterMonth && r.date) {
        const recordMonth = r.date.substring(0, 7); 
        if (recordMonth !== filterMonth) return false;
      }
      
      return true;
    });

    const q = normalize(query.trim());
    if (!q) return base;

    return base.filter(r => {
      const categoria = r.outlay_category_id !== null 
          ? categoriesById.get(r.outlay_category_id) ?? '' 
          : '';

      const proyecto = getProjectLabel(r.project_id); 
      
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
    filterCategoryId, filterProjectId, filterMonth
  ]);


  const handlePersist = async (data: Outlay) => {
    const result = await Swal.fire({
      title: '¿Guardar versión?',
      text: 'Esta acción actualizará el registro seleccionado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      focusCancel: true,
    })
    if (!result.isConfirmed) return

    try {

      const currentKey = `outlays:${data.id}`
      const currentState = localStorage.getItem(currentKey)
      if (currentState) {
        localStorage.setItem(currentKey, currentState) 
      }

      const savedId = await upsert(data)
      setSelectedId(savedId)

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
          options: projectOptionsGrouped },
      ] as any
    }
    return [
      ...base,
      { type: 'select', name: 'outlay_category_id', label: 'Categoría', required: true,
        options: categoryOptions },
    ] as any
  }, [isDirect, temporalityOptions, typeOptions, categoryOptions, projectOptionsGrouped])


  const handleFormChange = useCallback((draft: Outlay, name: string, value: unknown) => {
    if (name === 'outlay_types_id') {
      const v = Number(value)
      setTypeDraft(v)
      const nowDirect = v === 1
      if (nowDirect) draft.outlay_category_id = null as unknown as number
      else           draft.project_id         = null as unknown as number
      return draft
    }
  }, [])


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

  const handleDuplicate = useCallback(async (id: number) => {
    const res = await Swal.fire({
      title: '¿Duplicar registro?',
      text: 'Se creará una copia del registro seleccionado.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, duplicar',
      cancelButtonText: 'Cancelar',
      focusCancel: true,
    })
    if (!res.isConfirmed) return

    try {
      await duplicate(id)
      await Swal.fire({
        title: 'Duplicado',
        text: 'Se creó una copia del registro.',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
      })
 
    } catch (e: any) {
      await Swal.fire({
        title: 'Error',
        text: e?.message ?? 'No se pudo duplicar el registro.',
        icon: 'error',
      })
    }
  }, [duplicate])


  const handleDelete = useCallback(async (id: number) => {
    const res = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción eliminará el registro de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
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


  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'date', label: 'Fecha' },
    { key: 'detail', label: 'Detalle' },
    { key: 'amount', label: 'Monto' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'proyecto', label: 'Proyecto' },
  ] as const


  const tableScrollRef = useRef<HTMLDivElement>(null)
  const [, setCanScrollLeft] = useState(false)
  const [, setCanScrollRight] = useState(false)

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


  return (
    <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 mt-8">
      <div className="grid gap-6 2xl:grid-cols-[minmax(20rem,1.2fr)_minmax(24rem,2fr)]">

      <div className="white border rounded-2xl shadow-sm p-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
            <input
              placeholder="Buscar por detalle, categoría o proyecto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:flex-1 border rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              onClick={async() => setSelectedId(await create())}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border bg-[#CDEA80] text-[#303031] hover:bg-[#BDDEFF] hover:text-black"

            >
              Nuevo
            </button>
          </div>

        <div className="flex flex-wrap items-end gap-3 mb-3">
          <div className="flex flex-col flex-1 min-w-[200px]">
            <label htmlFor="flt-categoria" className="text-xs text-gray-600 mb-1">
              Categoría
            </label>
            <select
              id="flt-categoria"
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
              className="border rounded-xl p-2 text-sm"
              title="Filtra por categoría del desembolso"
              aria-label="Filtro de categoría"
            >
              <option value="">Todas las categorías</option>
              {uniqueCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col flex-1 min-w-[180px]">
            <label htmlFor="flt-proyecto" className="text-xs text-gray-600 mb-1">
              Proyecto
            </label>
            <select
              id="flt-proyecto"
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value === '' ? '' : Number(e.target.value))}
              className="border rounded-xl p-2 text-sm"
              title="Filtra por proyecto del desembolso"
              aria-label="Filtro de proyecto"
            >
              <option value="">Todos los proyectos</option>
              {uniqueProjects.map(proj => (
                <option key={proj.value} value={proj.value}>{proj.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="flt-mes" className="text-xs text-gray-600 mb-1">
              Mes
            </label>
            <input
              id="flt-mes"
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border rounded-xl p-2 text-sm"
              title="Mostrar registros del mes seleccionado"
              aria-label="Filtro de mes"
            />
          </div>


          {(filterCategoryId !== '' || filterProjectId !== '' || filterMonth !== '') && (
            <button
              type="button"
              onClick={() => { 
                setFilterCategoryId(''); 
                setFilterProjectId(''); 
                setFilterMonth(''); 
              }}
              className="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50"
              title="Borrar filtros aplicados"
            >
              Limpiar Filtros
            </button>
          )}
        </div>

          <div className="md:hidden space-y-2">
            {filtered.map(row => (
              <div
                key={row.id}
                className={`border rounded-xl p-3 ${row.id === selectedId ? 'bg-indigo-50' : 'bg-white'} overflow-hidden`}

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
                <div className="text-left">
                  <div className="text-xs text-gray-500">Monto</div>
                  <div className="font-medium tabular-nums">
                    ${Number(row.amount ?? 0).toFixed()}

                  </div>
                </div>
              </div>

                <div className="mt-2 min-w-0">
                  <div className="text-xs text-gray-500">Detalle</div>
                  <div className="line-clamp-2 break-words">{row.detail}</div>
                </div>

              <div className="mt-3 space-y-2">
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Categoría</div>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg break-words line-clamp-2">
                    {safeGet(categoriesById, row.outlay_category_id)}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Proyecto</div>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg break-words line-clamp-2">
                    {getProjectLabel(row.project_id)}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-3 flex-wrap">
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
                    onClick={() => handleDuplicate(row.id)}  
                  >
                    Duplicar
                  </button>

                  <button
                    className="underline text-red-600"
                    onClick={() => handleDelete(row.id)} 
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


 
            <div
              ref={tableScrollRef}
              className="hidden md:block relative overflow-x-auto overflow-y-auto border rounded-xl max-h-[65vh]"
            >
         
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#303031] to-transparent rounded-tr-xl rounded-br-xl -z-10" />
            <table className="w-full text-xs lg:text-sm border-collapse">


            <thead className="bg-gray-50 sticky top-0 z-30 shadow text-[10px] lg:text-xs xl:text-sm">
              <tr>
                {columns.map(c => (
                  <th
                    key={c.key as string}
                    className={`text-left py-2 font-medium text-gray-700 whitespace-nowrap
                      ${c.key === 'id' ? 'px-1 lg:px-2 w-12 lg:w-16' : ''}
                      ${c.key === 'date' ? 'px-1 lg:px-2 w-20 lg:w-24' : ''}
                      ${c.key === 'detail' ? 'px-1 lg:px-2 max-w-[120px] lg:max-w-[200px] xl:max-w-none' : ''}
                      ${c.key === 'amount' ? 'px-1 lg:px-2 w-20 lg:w-24' : ''}
                      ${c.key === 'categoria' ? 'px-1 lg:px-2 max-w-[100px] lg:max-w-[150px]' : ''}
                      ${c.key === 'proyecto' ? 'px-1 lg:px-2 max-w-[150px] lg:max-w-[220px] xl:min-w-[250px]' : ''}
                    `}
                  >
                    {c.label}
                  </th>
                ))}
                         
                <th className="px-1 lg:px-2 py-2 text-right whitespace-nowrap sticky right-0 z-20 bg-gray-50 border-l w-[140px] lg:w-[160px]">
                  Acciones
                </th>


              </tr>
            </thead>

              <tbody className="text-[10px] lg:text-xs xl:text-sm">
                {filtered.map(row => (
                  <tr
                    key={row.id}
                    className={`border-t ${row.id === selectedId ? 'bg-indigo-50' : 'bg-white'}`}
                  >
                    <td className="px-1 lg:px-2 py-1.5 lg:py-2 tabular-nums text-center">
                      {row.id < 0 ? 'Nuevo' : row.id}
                    </td>
                    <td className="px-1 lg:px-2 py-1.5 lg:py-2 tabular-nums whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="px-1 lg:px-2 py-1.5 lg:py-2">
                      <div className="line-clamp-2 max-w-[120px] lg:max-w-[200px] xl:max-w-none break-words" >
                        {row.detail}
                      </div>
                    </td>
                    <td className="px-1 lg:px-2 py-1.5 lg:py-2 tabular-nums whitespace-nowrap text-right">
                      ${Number(row.amount ?? 0).toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-1 lg:px-2 py-1.5 lg:py-2">
                      <div className="truncate max-w-[100px] lg:max-w-[150px]" title={safeGet(categoriesById, row.outlay_category_id)}>
                        {safeGet(categoriesById, row.outlay_category_id)}
                      </div>
                    </td>
                    <td className="px-1 lg:px-2 py-1.5 lg:py-2">
                      <div className="truncate max-w-[150px] lg:max-w-[220px] xl:max-w-[250px]" title={getProjectLabel(row.project_id)}>
                        {getProjectLabel(row.project_id)}
                      </div>
                    </td>
                    <td className={`px-1 lg:px-2 py-1.5 lg:py-2 sticky right-0 z-10 border-l ${row.id === selectedId ? 'bg-indigo-50' : 'bg-white'}`}>

                    <div className="flex gap-1 lg:gap-2 justify-end text-[10px] lg:text-xs whitespace-nowrap">

                      <button
                        className="underline text-indigo-700 hover:text-indigo-900 px-0.5"
                        onClick={() => setSelectedId(row.id)}
                        aria-label={`Editar ${row.id}`}
                        title="Editar"
                      >
                        Editar
                      </button>
                      <button
                        className="underline hover:text-gray-700 px-0.5"
                        onClick={() => handleDuplicate(row.id)}
                        title="Duplicar"
                      >
                        Duplicar
                      </button>
                      <button
                        className="underline text-red-600 hover:text-red-800 px-0.5"
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

      <div ref={editorRef} className="scroll-mt-4 sm:scroll-mt-6">
      {selected ? (
      <EditableFormSection<Outlay>
          title={`Editar desembolso #${selected.id < 0 ? '—nuevo—' : selected.id}`}
          storageKey={`outlays:${selected.id}`}
          seed={selected as Outlay}
          onPersist={handlePersist}
          onChange={handleFormChange}
          fields={fieldsForOutlay}
          header={headerForOutlays}     
        />
      ) : (
        <div className="white border rounded-2xl shadow-sm p-6 flex items-center justify-center text-gray-600">
          Selecciona un registro para editar o crea uno nuevo.
        </div>
      )}
      </div>
    </div>
  </div>
)
}
