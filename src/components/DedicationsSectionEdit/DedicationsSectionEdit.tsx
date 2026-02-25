import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import { EditableFormSection } from '../EditableFormSection/EditableFormSection'
import { useDedicationsRemoteDataset, Dedication } from '../../hooks/useDedicationsRemoteDataset'
import { useUsersCatalog } from '../../hooks/useUsersCatalog'
import { getProjectLabel } from '../../utils/outlays/projectBucket'

import { getProjectsAndActivities } from '../../api/projects/get-projects'
import { buildProjectOptGroups } from '../../utils/outlays/projectBucket'
import { normalizeProjects } from '../../utils/projects/normalize'
import type { IProject } from '../../interfaces/projects/projects.interface'

export function DedicationsSectionEdit() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : ''
  const { records, upsert, remove, duplicate, create } = useDedicationsRemoteDataset({ token })
  const { userOptions, usersById } = useUsersCatalog(token)

  const [projects, setProjects] = useState<IProject[]>([])
  const [showActiveOnly,] = useState(true)

  useEffect(() => {
    if (!token) return
    getProjectsAndActivities(token)
      .then((data: any) => setProjects(normalizeProjects(data?.projects || [])))
      .catch(() => setProjects([]))
  }, [token])

  const projectsById = useMemo(() => {
    const m = new Map<number, string>()
    for (const p of projects) m.set(Number(p.id), getProjectLabel(p))
    return m
  }, [projects])


  const availableUserIds = useMemo(() => {
    const ids = new Set<number>()
    records.forEach(r => {
      if (r.user_id != null) ids.add(Number(r.user_id))
    })
    return Array.from(ids).sort((a, b) => {
      const nameA = usersById.get(a) || ''
      const nameB = usersById.get(b) || ''
      return nameA.localeCompare(nameB)
    })
  }, [records, usersById])


  const availableProjectIds = useMemo(() => {
    const ids = new Set<number>()
    records.forEach(r => {
      if (r.project_id != null) ids.add(Number(r.project_id))
    })
    return Array.from(ids).sort((a, b) => {
      const nameA = projectsById.get(a) || ''
      const nameB = projectsById.get(b) || ''
      return nameA.localeCompare(nameB)
    })
  }, [records, projectsById])

  const projectOptionsGrouped = useMemo(() => {
    const groups = buildProjectOptGroups(projects, showActiveOnly)
    const sep = (label: string) => ({ label: `── ${label} ──`, value: `#sep#${label}` })
    return groups.flatMap(g => [sep(g.label), ...g.options])
  }, [projects, showActiveOnly])


  const [query, setQuery] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterUserId, setFilterUserId] = useState<string>('')
  const [filterProjectId, setFilterProjectId] = useState<string>('')
  const [filterDedicationThreshold, setFilterDedicationThreshold] = useState(0)
  const [isDedicationFilterActive, setIsDedicationFilterActive] = useState(false)


  const [selectedId, setSelectedId] = useState<number | null>(null)
  useEffect(() => {
    if (selectedId == null) return
    if (records.length === 0) { setSelectedId(null); return }
    const still = records.some(r => r.id === selectedId)
    if (!still) setSelectedId(null)
  }, [records, selectedId])


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

 
  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

  const filtered = useMemo(() => {
    let base = records

    if (filterMonth) {
      base = base.filter(r => r.week === filterMonth)
    }

    if (filterUserId) {
      base = base.filter(r => String(r.user_id) === filterUserId)
    }

    if (filterProjectId) {
      base = base.filter(r => String(r.project_id) === filterProjectId)
    }

    if (isDedicationFilterActive) {
      base = base.filter(r => {
        const pct = Number(r.dedicated ?? 0)
        return pct >= filterDedicationThreshold
      })
    }

    const q = normalize(query.trim())
    if (!q) return base

    return base.filter(r => {
      const userName = usersById.get(Number(r.user_id)) ?? ''
      const detail = r.detail ?? ''
      const haystack = [userName, detail].join(' | ')
      return normalize(haystack).includes(q)
    })
  }, [records, query, filterMonth, filterUserId, filterProjectId, filterDedicationThreshold, isDedicationFilterActive, usersById])


  const selected = useMemo(
    () => records.find(r => r.id === selectedId) ?? null,
    [records, selectedId]
  )


  const handlePersist = useCallback(async (data: Dedication) => {
    const missing: string[] = []
    if (!data.user_id) missing.push('Usuario')
    if (!data.project_id) missing.push('Proyecto')
    if (!data.week) missing.push('Semana/Fecha')
    const pct = Number(data.dedicated)
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) missing.push('Porcentaje (0..100)')


    if (missing.length) {
      await Swal.fire({ title: 'Campos obligatorios', text: `Completa: ${missing.join(', ')}`, icon: 'warning' })
      return
    }

    const res = await Swal.fire({
      title: '¿Guardar dedicación?',
      text: 'Se actualizará el registro seleccionado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
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
      focusCancel: true,
    })

  const safeGet = (map: Map<number, string>, id: number | null | undefined, fallback?: string) =>
    id == null ? (fallback ?? '—') : (map.get(Number(id)) ?? (fallback ?? '—'))
 

    const fmtYMD = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
    }

    const parseYMDLocal = (ymd: string) => {
    const [y, m, d] = ymd.split('-').map(Number)
    return new Date(y, (m ?? 1) - 1, d ?? 1) 
    }

    const getMondayLocalFromYMD = (ymd: string) => {
    const d = parseYMDLocal(ymd)
    const dow = d.getDay() || 7
    if (dow !== 1) d.setDate(d.getDate() - (dow - 1))
    return d
    }

    const getFridayFromMondayLocal = (monday: Date) => {
    const f = new Date(monday)
    f.setDate(f.getDate() + 4)
    return f
    }


  const columns = [
    { key: 'id',        label: 'ID', width: 'w-16' },
    { key: 'week',      label: 'Semana', width: 'w-28' },
    { key: 'project',   label: 'Proyecto', width: 'min-w-[200px] max-w-[300px]' },
    { key: 'dedicated', label: '%', width: 'w-16' },
    { key: 'user',      label: 'Usuario', width: 'min-w-[150px]' },
  ] as const


  const tableScrollRef = useRef<HTMLDivElement>(null)
  const [, setCanScrollLeft]   = useState(false)
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


type BulkDraft = {
  id: number
  project_id: number | null
  week: string
  dedicated: number
  original: Dedication
}

const [bulkDrafts, setBulkDrafts] = useState<BulkDraft[]>([])
const [bulkBusy, setBulkBusy] = useState(false)


useEffect(() => {
  if (!selected) {
    setBulkDrafts([])
    return
  }
  const mondayYMD = selected.week
  const sameUserSameWeek = records.filter(r =>
    String(r.user_id) === String(selected.user_id) && r.week === mondayYMD
  )
  const next = sameUserSameWeek.map(r => ({
    id: r.id,
    project_id: r.project_id == null ? null : Number(r.project_id),
    week: r.week ?? '',
    dedicated: Number(r.dedicated ?? 0),
    original: r
  }))
  setBulkDrafts(next)
}, [selected, records])


const setDraftField = useCallback((rowId: number, patch: Partial<BulkDraft>) => {
  setBulkDrafts(curr => curr.map(d => (d.id === rowId ? { ...d, ...patch } : d)))
}, [])

const adjustToMondayYMD = (ymd: string) => fmtYMD(getMondayLocalFromYMD(ymd))


const totalPct = useMemo(() => {
  return bulkDrafts.reduce((acc, d) => acc + (Number.isFinite(d.dedicated) ? Number(d.dedicated) : 0), 0)
}, [bulkDrafts])

const bulkHasErrors = useMemo(() => {
  if (!selected) return true
  if (totalPct > 100) return true
  for (const d of bulkDrafts) {
    const pctOk = Number.isFinite(d.dedicated) && d.dedicated >= 0 && d.dedicated <= 100
    const weekOk = typeof d.week === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.week)
    const projOk = d.project_id != null && !Number.isNaN(Number(d.project_id))
    if (!pctOk || !weekOk || !projOk) return true
  }
  return false
}, [bulkDrafts, selected, totalPct])


const handleBulkSave = useCallback(async () => {
  if (!selected) return
  if (bulkHasErrors) {
    await Swal.fire({ title: 'Revisa los datos', text: 'Corrige los errores antes de guardar.', icon: 'warning' })
    return
  }

  const res = await Swal.fire({
    title: '¿Guardar cambios del grupo?',
    text: 'Se actualizarán los registros uno por uno.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, guardar grupo',
    cancelButtonText: 'Cancelar',
    focusCancel: true
  })
  if (!res.isConfirmed) return

  try {
    setBulkBusy(true)
    for (const d of bulkDrafts) {
      const nextRecord: Dedication = {
        ...d.original,
        project_id: d.project_id as any,
        week: adjustToMondayYMD(d.week),
        end_of_week: fmtYMD(getFridayFromMondayLocal(parseYMDLocal(adjustToMondayYMD(d.week)))),
        dedicated: d.dedicated
      }
      const changed =
        JSON.stringify({
          project_id: d.original.project_id,
          week: d.original.week,
          dedicated: d.original.dedicated
        }) !==
        JSON.stringify({
          project_id: nextRecord.project_id,
          week: nextRecord.week,
          dedicated: nextRecord.dedicated
        })

      if (changed) {
        await upsert(nextRecord)
      }
    }
    await Swal.fire({ title: 'Grupo guardado', icon: 'success', timer: 1500, showConfirmButton: false })
  } catch (e: any) {
    await Swal.fire({
      title: 'Error al guardar el grupo',
      html: `No se pudieron guardar algunos cambios.<br/><small>${e?.message ?? 'Error inesperado'}</small>`,
      icon: 'error'
    })
  } finally {
    setBulkBusy(false)
  }
}, [bulkDrafts, bulkHasErrors, selected, upsert])

const HIDE_SINGLE_EDIT = true

const BulkEditPanel = selected ? (
  <div className="white border rounded-2xl shadow-sm p-4 sm:p-6">
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base sm:text-lg font-semibold">
          Edición grupal
        </h2>
        <span className={`text-sm font-semibold shrink-0 ${totalPct > 100 ? 'text-red-700' : 'text-gray-700'}`}>
          Total: {totalPct}%
        </span>
      </div>
      <div className="text-xs text-gray-600">
        <span className="font-medium">Usuario:</span> {safeGet(usersById, selected.user_id, `ID ${selected.user_id}`)}
        {' • '}
        <span className="font-medium">Semana:</span> {selected.week}
      </div>
    </div>


    <div className="md:hidden mt-3 space-y-3">
      {bulkDrafts.map(row => (
        <div key={row.id} className="border rounded-xl p-3">
          <div className="flex items-baseline justify-between">
            <div className="text-xs text-gray-500">ID</div>
            <div className="font-medium tabular-nums">{row.id < 0 ? 'Nuevo' : row.id}</div>
          </div>

          <div className="mt-2">
            <label className="text-xs text-gray-600">Proyecto</label>
            <select
              value={String(row.project_id ?? '')}
              onChange={e => {
                const v = e.target.value
                if (v.startsWith('#sep#')) return
                setDraftField(row.id, { project_id: v === '' ? null : Number(v) })
              }}
              className="mt-1 w-full border rounded-lg p-2"
            >
              <option value="">Seleccione...</option>
              {(() => {
                const seen = new Set<string>()
                const cleanOptions = projectOptionsGrouped.filter(op => {
                  const key = String(op.value)
                  if (seen.has(key)) return false
                  seen.add(key)
                  return true
                })
                return cleanOptions.map((op, idx) => {
                  const v = String(op.value)
                  const isSep = v.startsWith('#sep#')
                  return (
                    <option key={`${v}-${idx}`} value={v} disabled={isSep} className={isSep ? 'text-gray-400 font-semibold' : ''}>
                      {op.label}
                    </option>
                  )
                })
              })()}
            </select>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Semana (Lunes)</label>
              <input
                type="date"
                value={row.week}
                step={7}
                min="2020-01-06"
                onChange={e => {
                  const raw = String(e.target.value || '')
                  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return
                  const monday = adjustToMondayYMD(raw)
                  setDraftField(row.id, { week: monday })
                }}
                className="mt-1 w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">Dedicación (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={Number(row.dedicated ?? 0)}
                onChange={e => setDraftField(row.id, { dedicated: Number(e.target.value) })}
                className="mt-1 w-full border rounded-lg p-2"
              />
            </div>
          </div>
        </div>
      ))}
      {bulkDrafts.length === 0 && (
        <div className="px-3 py-4 text-center text-gray-500 border rounded-xl">No hay registros para esta semana</div>
      )}
    </div>

    <div className="hidden md:block mt-4">
      <div className="relative overflow-x-auto border rounded-xl">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 w-20">ID</th>
              <th className="text-left px-3 py-2 w-[320px]">Proyecto</th>
              <th className="text-left px-3 py-2 w-56">Semana (Lunes)</th>
              <th className="text-left px-3 py-2 w-48">Dedicación (%)</th>
            </tr>
          </thead>
          <tbody>
            {bulkDrafts.map(row => (
              <tr key={row.id} className="border-t white">
                <td className="px-3 py-2 tabular-nums">{row.id < 0 ? 'Nuevo' : row.id}</td>
                <td className="px-3 py-2">
                  <select
                    value={String(row.project_id ?? '')}
                    onChange={e => {
                      const v = e.target.value
                      if (v.startsWith('#sep#')) return
                      setDraftField(row.id, { project_id: v === '' ? null : Number(v) })
                    }}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Seleccione...</option>
                    {(() => {
                      const seen = new Set<string>()
                      const cleanOptions = projectOptionsGrouped.filter(op => {
                        const key = String(op.value)
                        if (seen.has(key)) return false
                        seen.add(key)
                        return true
                      })
                      return cleanOptions.map((op, idx) => {
                        const v = String(op.value)
                        const isSep = v.startsWith('#sep#')
                        return (
                          <option key={`${v}-${idx}`} value={v} disabled={isSep} className={isSep ? 'text-gray-400 font-semibold' : ''}>
                            {op.label}
                          </option>
                        )
                      })
                    })()}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    value={row.week}
                    step={7}
                    min="2020-01-06"
                    onChange={e => {
                      const raw = String(e.target.value || '')
                      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return
                      const monday = adjustToMondayYMD(raw)
                      setDraftField(row.id, { week: monday })
                    }}
                    className="w-full border rounded-lg p-2"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={Number(row.dedicated ?? 0)}
                    onChange={e => setDraftField(row.id, { dedicated: Number(e.target.value) })}
                    className="w-36 border rounded-lg p-2"
                  />
                </td>
              </tr>
            ))}
            {bulkDrafts.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-gray-500" colSpan={4}>No hay registros para esta semana</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    <div className="flex flex-col gap-2 mt-4">
      <div className="text-xs text-gray-500">
        La agrupación corresponde a usuario y semana (lunes).
      </div>
      <button
        onClick={handleBulkSave}
        disabled={bulkBusy || bulkHasErrors || bulkDrafts.length === 0}
        className={`w-full px-4 py-2 rounded-xl border text-sm ${bulkBusy || bulkHasErrors || bulkDrafts.length === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#CDEA80] text-[#303031] hover:bg-[#BDDEFF] hover:text-black'}`}
        title={totalPct > 100 ? 'La suma de porcentajes supera 100%' : 'Guardar cambios del grupo'}
      >
        {bulkBusy ? 'Guardando...' : 'Guardar cambios del grupo'}
      </button>
    </div>

  </div>
) : null

  const hasActiveFilters = 
    filterMonth !== '' || 
    filterUserId !== '' || 
    filterProjectId !== '' || 
    isDedicationFilterActive

  const clearAllFilters = () => {
    setFilterMonth('')
    setFilterUserId('')
    setFilterProjectId('')
    setFilterDedicationThreshold(0)
    setIsDedicationFilterActive(false)
  }


  return (
    <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 mt-8">
      <div className="grid gap-6 2xl:[grid-template-columns:minmax(20rem,1.2fr)_minmax(24rem,2fr)]">

        <div className="white border rounded-2xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
            <input
              placeholder="Buscar por detalle o usuario..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:flex-1 border rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              onClick={async () => setSelectedId(await create())}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border bg-[#CDEA80] text-[#303031] hover:bg-[#BDDEFF] hover:text-black"
            >
              Nuevo
            </button>
          </div>


            <div className="flex flex-col gap-3 mb-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <label htmlFor="flt-week" className="text-xs text-gray-600 mb-1">Semana (Lunes)</label>
                  <input
                    id="flt-week"
                    type="date"
                    value={filterMonth}
                    onChange={(e) => {
                      const raw = e.target.value
                      if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
                        const monday = adjustToMondayYMD(raw)
                        setFilterMonth(monday)
                      } else {
                        setFilterMonth('')
                      }
                    }}
                    className="border rounded-xl p-2 text-sm"
                    title="Filtrar por semana (lunes)"
                    step={7}
                    min="2020-01-06"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="flt-user" className="text-xs text-gray-600 mb-1">Usuario</label>
                  <select
                    id="flt-user"
                    value={filterUserId}
                    onChange={(e) => setFilterUserId(e.target.value)}
                    className="border rounded-xl p-2 text-sm"
                    title="Filtrar por usuario"
                  >
                    <option value="">Todos los usuarios</option>
                    {availableUserIds.map(uid => (
                      <option key={uid} value={String(uid)}>
                        {usersById.get(uid) || `ID ${uid}`}
                      </option>
                    ))}
                  </select>
                </div>


                <div className="flex flex-col">
                  <label htmlFor="flt-project" className="text-xs text-gray-600 mb-1">Proyecto</label>
                  <select
                    id="flt-project"
                    value={filterProjectId}
                    onChange={(e) => setFilterProjectId(e.target.value)}
                    className="border rounded-xl p-2 text-sm"
                    title="Filtrar por proyecto"
                  >
                    <option value="">Todos los proyectos</option>
                    {availableProjectIds.map(pid => (
                      <option key={pid} value={String(pid)}>
                        {projectsById.get(pid) || `ID ${pid}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-600 font-medium">
                      Filtrar dedicaciones con mínimo de
                    </label>
                    <button
                      onClick={() => {
                        setIsDedicationFilterActive(!isDedicationFilterActive)
                        if (isDedicationFilterActive) {
                          setFilterDedicationThreshold(0)
                        }
                      }}
                      className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                        isDedicationFilterActive
                          ? 'bg-[#CDEA80] text-[#303031] hover:bg-[#BDDEFF]'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {isDedicationFilterActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-700 font-semibold">
                    {filterDedicationThreshold}%
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 shrink-0">0%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={filterDedicationThreshold}
                      onChange={(e) => {
                        setFilterDedicationThreshold(Number(e.target.value))
                        setIsDedicationFilterActive(true)
                      }}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#CDEA80]"
                      title="Dedicación mínima"
                    />
                    <span className="text-xs text-gray-500 shrink-0">100%</span>
                  </div>
                </div>
              </div> 

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-4 py-2 rounded-xl border bg-gray-100 hover:bg-gray-200 text-sm"
                    title="Limpiar todos los filtros"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>


          <div className="md:hidden space-y-2">
            {filtered.map(row => (
              <div key={row.id} className={`border rounded-xl p-3 ${row.id === selectedId ? 'bg-indigo-50/40' : 'white'}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-gray-500">ID</span>
                  <span className="font-medium tabular-nums">{row.id < 0 ? 'Nuevo' : row.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <div className="text-xs text-gray-500">Semana</div>
                    <div className="tabular-nums">{row.week}</div>
                  </div>
           
                    <div className="text-right">
                        <div className="text-xs text-gray-500">Dedicación</div>
                        <div className="font-medium tabular-nums">{Number(row.dedicated ?? 0)}%</div>
                    </div>
                </div>
                <div className="mt-2 min-w-0">
                  <div className="text-xs text-gray-500">Proyecto</div>
                  <div className="line-clamp-2 break-words">{safeGet(projectsById, row.project_id, row.project_name)}</div>
                </div>
                <div className="mt-3 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Usuario</div>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg break-words">
                    {safeGet(usersById, row.user_id, `ID ${row.user_id}`)}
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-3">
                  <button className="underline text-indigo-700" onClick={() => setSelectedId(row.id)}>Editar</button>
                  <button
                    className="underline"
                    onClick={async () => {
                      const res = await confirm('¿Duplicar dedicación?', 'Se creará una copia idéntica.', 'Sí, duplicar')
                      if (!res.isConfirmed) return
                      await duplicate(row.id)
                      Swal.fire({ title: 'Duplicado', icon: 'success', timer: 1200, showConfirmButton: false })
                    }}
                  >Duplicar</button>
                  <button className="underline text-red-600" onClick={async () => {
                    const res = await Swal.fire({ title:'¿Eliminar?', text: 'Esta acción eliminará el registro de forma permanente.', icon:'warning', showCancelButton:true, confirmButtonText:'Sí, eliminar', cancelButtonText:'Cancelar', focusCancel:true })
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


          <div
            ref={tableScrollRef}
            className="hidden md:block relative overflow-x-auto overflow-y-auto border rounded-xl max-h-[65vh]"
          >
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#303031]-to-transparent rounded-tr-xl rounded-br-xl -z-10" />
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

     
                    <th className="px-3 py-2 text-right whitespace-nowrap sticky right-0 z-20 bg-gray-50 border-l">
                      Acciones
                    </th>
                </tr>
              </thead>


              <tbody>
                {filtered.map(row => (
                  <tr key={row.id} className={`border-t ${row.id === selectedId ? 'bg-[#CDEA80]' : 'white'}`}>
                    <td className="px-3 py-2 tabular-nums">{row.id < 0 ? 'Nuevo' : row.id}</td>
                      <td className="px-3 py-2 tabular-nums whitespace-nowrap">{row.week}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{safeGet(projectsById, row.project_id, row.project_name)}</td>
                      <td className="px-3 py-2 tabular-nums whitespace-nowrap">{Number(row.dedicated ?? 0)}%</td>
                      <td className="px-3 py-2 whitespace-nowrap">{safeGet(usersById, row.user_id, `ID ${row.user_id}`)}</td>
                      <td className="px-3 py-2 sticky right-0 z-10 bg-white border-l">
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
                          onClick={async () => {
                            const res = await confirm('¿Duplicar dedicación?', 'Se creará una copia idéntica.', 'Sí, duplicar')
                            if (!res.isConfirmed) return
                            await duplicate(row.id)
                            Swal.fire({ title: 'Duplicado', icon: 'success', timer: 1200, showConfirmButton: false })
                          }}
                          title="Duplicar"
                        >
                          Duplicar
                        </button>
                        <button
                          className="underline text-red-600"
                          onClick={async () => {
                            const res = await Swal.fire({
                              title:'¿Eliminar?', text:'Esta acción eliminará el registro de forma permanente.',
                              icon:'warning', showCancelButton:true, confirmButtonText:'Sí, eliminar',
                              cancelButtonText:'Cancelar', focusCancel:true,
                            })
                            if (!res.isConfirmed) return
                            await remove(row.id)
                            if (row.id === selectedId) setSelectedId(null)
                            Swal.fire({ title:'Eliminado', icon:'success', timer:1200, showConfirmButton:false })
                          }}
                          title="Eliminar"
                        >
                          Eliminar
                        </button>
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

        <div ref={editorRef} className="scroll-mt-4 sm:scroll-mt-6">
          {selected ? (
            HIDE_SINGLE_EDIT ? (
              BulkEditPanel
            ) : (
              <EditableFormSection<Dedication>
                title={`Editar dedicación #${selected.id < 0 ? '—nuevo—' : selected.id}`}
                storageKey={`dedications:${selected.id}`}
                seed={selected}
                onPersist={handlePersist}
                onChange={(draft, name, value) => {
                  if (name === 'week') {
                    const raw = String(value || '')
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { ...draft } as Dedication
                    const monday = getMondayLocalFromYMD(raw)
                    const friday = getFridayFromMondayLocal(monday)
                    return { ...draft, week: fmtYMD(monday), end_of_week: fmtYMD(friday) } as Dedication
                  }
                }}
                fields={[
                  { type: 'number', name: 'id', label: 'ID', required: true, readonly: true },
                  { type: 'select', name: 'user_id', label: 'Usuario', required: true, options: userOptions },
                  { type: 'select', name: 'project_id', label: 'Proyecto', required: true, options: projectOptionsGrouped },
                  { type: 'date', name: 'week', label: 'Semana (Lunes)', required: true, step: 7, min: '2020-01-06', help: 'Sólo lunes. Si eliges otro día, se ajusta automáticamente al lunes de esa semana.' },
                  { type: 'number', name: 'dedicated', label: 'Porcentaje de Dedicación (%)', required: true, step: 1, min: 0, max: 100, help: 'Ingresa 0..100. Al guardar se envía como fracción (50 → 0.5).' },
                  { type: 'textarea', name: 'detail', label: 'Detalle', colSpan: 2, rows: 5, placeholder: 'Ej: Tareas del sprint' }
                ]}
                header={BulkEditPanel}
              />
            )
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
