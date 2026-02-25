import { useEffect, useState } from 'react'
import * as DedRead from '../api/dedications/read'
import * as DedMutate from '../api/dedications/mutate'
import type { IDedicationBasicInput } from '../api/dedications/mutate'

export type Dedication = {
  id: number
  user_id: number
  project_id: number
  project_name?: string
  client_name?: string
  week: string            
  end_of_week?: string       
  consolidation?: boolean 
  dedicated: number         
  detail?: string
}


type Options = { token: string }


function fromApiRow(r: any): Dedication {
  const frac = Number(r?.dedicated ?? 0) 
  const week = String(r?.week ?? r?.date ?? '').slice(0, 10)
  const endWeek = String(r?.end_of_week ?? '').slice(0, 10) || computeFriday(week) 

  return {
    id: Number(r?.id ?? 0),
    user_id: Number(r?.user_id ?? r?.user?.id ?? 0),
    project_id: Number(r?.project_id ?? r?.project?.id ?? 0),
    project_name: String(r?.project_name ?? r?.project?.name ?? ''),
    week,
    end_of_week: endWeek,
    consolidation: true,
    dedicated: Math.round(frac * 100), 
    detail: r?.detail ?? '',
  }
}


function validateBeforeSend(d: Dedication) {
  const errs: string[] = []
  if (!d.user_id) errs.push('Usuario')
  if (!d.project_id) errs.push('Proyecto')
  if (!d.week) errs.push('Semana/Fecha')
  if (!Number.isFinite(Number(d.dedicated)) || Number(d.dedicated) < 0 || Number(d.dedicated) > 100) {
    errs.push('Porcentaje de dedicación (0 a 100)')
  }

  return errs
}

    function fmtYMD(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
    }
    function parseYMDLocal(ymd: string) {
    const [y, m, d] = ymd.split('-').map(Number)
    return new Date(y, (m ?? 1) - 1, d ?? 1)
    }
    function toMonday(ymd: string): string {
    const d = parseYMDLocal(ymd)
    if (isNaN(d.getTime())) return ''
    const day = d.getDay() || 7
    if (day !== 1) d.setDate(d.getDate() - (day - 1))
    return fmtYMD(d)
    }
    function computeFriday(mondayStr: string): string {
    const d = parseYMDLocal(mondayStr)
    if (isNaN(d.getTime())) return ''
    d.setDate(d.getDate() + 4)
    return fmtYMD(d)
    }


export function useDedicationsRemoteDataset({ token }: Options) {
  const [records, setRecords] = useState<Dedication[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!token) { setRecords([]); return }
      try {
        const data = await DedRead.getDedications(token)
        if (!cancelled) {
          const arr = Array.isArray(data) ? data : []
          setRecords(arr.map(fromApiRow))
        }
      } catch {
        if (!cancelled) setRecords([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])


  async function create() {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')


    const monday = toMonday(`${y}-${m}-${d}`)
    const temp: Dedication = {
    id: -Date.now(),
    user_id: Number(localStorage.getItem('userId') ?? 1),
    project_id: 1,
    week: monday,                         
    end_of_week: computeFriday(monday), 
    consolidation: true,
    dedicated: 0,                   
    detail: '',
    }

    setRecords(prev => [temp, ...prev])
    return temp.id
  }


  async function upsert(data: Dedication) {
    const missing = validateBeforeSend(data)
    if (missing.length) throw new Error(`Faltan: ${missing.join(', ')}`)

    const weekMonday = toMonday(data.week)
    const payload: IDedicationBasicInput = {
    user_id: Number(data.user_id),
    project_id: Number(data.project_id),
    week: weekMonday,                          
    end_of_week: computeFriday(weekMonday),    
    consolidation: true,
    dedicated: Number(data.dedicated) / 100,    
    detail: data.detail ?? '',
    }



    if (data.id < 0) {
      const res = await DedMutate.addDedication(token, payload)
      const newId = Number(res?.id ?? Date.now())
      setRecords(prev => {
        const next = prev.filter(r => r.id !== data.id)
        return [{ ...data, id: newId }, ...next]
      })
      return newId
    }

    await DedMutate.updateDedication(token, data.id, payload)
    setRecords(prev => prev.map(r => r.id === data.id ? { ...data } : r))
    return data.id
  }


  async function remove(id: number) {
    if (id < 0) {
      setRecords(prev => prev.filter(r => r.id !== id))
      return
    }
    await DedMutate.deleteDedication(token, id)
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  async function duplicate(id: number) {
    const src = records.find(r => r.id === id)
    if (!src) return
    const clone: Dedication = {
      ...src,
      id: -Date.now(),
      detail: src.detail ? `${src.detail} (copia)` : 'copia',
    }
    setRecords(prev => [clone, ...prev])
    const res = await DedMutate.addDedication(token, {
    user_id: clone.user_id,
    project_id: clone.project_id,
    week: clone.week,                               
    end_of_week: clone.end_of_week,                 
    consolidation: true,
    dedicated: Number(clone.dedicated) / 100,       
    detail: clone.detail,
    })

    const newId = Number(res?.id ?? Date.now())
    setRecords(prev => prev.map(r => r.id === clone.id ? { ...clone, id: newId } : r))
    return newId
  }

  return { records, create, upsert, remove, duplicate }
}
