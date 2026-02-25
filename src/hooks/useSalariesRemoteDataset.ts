import { useEffect, useState } from 'react'
import { getSalaries } from '../api/salaries/read'
import { addSalary, updateSalary, deleteSalary } from '../api/salaries/mutate'

import type { ISalaries } from '../interfaces/salaries/salaries.interface'


export type Salary = Omit<ISalaries, 'salarie'> & {
  id: number
  salarie: number | string | null 
}

type Options = { token: string }


function fromApiRow(r: any): Salary {
  const amount = r?.amount ?? r?.salarie ?? 0
  return {
    id: Number(r?.id ?? 0),
    user_id: Number(r?.user_id ?? 0),
    salarie: Number(amount),
    detail: String(r?.detail ?? ''),
    date: String(r?.date ?? ''),
  }
}

function validateBeforeSend(s: Salary) {
  const errs: string[] = []
  if (!s.user_id) errs.push('Usuario')
  if (!s.date) errs.push('Fecha')
  const n = Number(String(s.salarie ?? '0').replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(n) || n < 0) errs.push('Monto (≥ 0)')
  if (!s.detail || !String(s.detail).trim()) errs.push('Detalle')
  return errs
}


export function useSalariesRemoteDataset({ token }: Options) {
  const [records, setRecords] = useState<Salary[]>([])


  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!token) { 
        setRecords([])
        return 
      }
      try {
        const { data } = await getSalaries(token)
        if (!cancelled) {
          const rows = Array.isArray(data) ? data : []
          setRecords(rows.map(fromApiRow))
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
    const temp: Salary = {
      id: -Date.now(),
      user_id: Number(localStorage.getItem('userId') ?? 1),
      salarie: 0,
      detail: '',
      date: `${y}-${m}-01`,
    }
    setRecords(prev => [temp, ...prev])
    return temp.id
  }


  async function upsert(data: Salary) {
    const missing = validateBeforeSend(data)
    if (missing.length) throw new Error(`Faltan: ${missing.join(', ')}`)

    const toSend: ISalaries = {
      user_id: data.user_id,
      salarie: String(data.salarie ?? '0'),
      detail: data.detail,
      date: data.date,
    }

    if (data.id < 0) {
      const res = await addSalary(token, toSend)
      const newId = Number(res?.id ?? Date.now())
      setRecords(prev => {
        const filtered = prev.filter(r => r.id !== data.id)
        return [{ ...data, id: newId }, ...filtered]
      })
      return newId
    }

    await updateSalary(token, data.id, toSend)
    setRecords(prev => prev.map(r => r.id === data.id ? { ...data } : r))
    return data.id
  }


  async function remove(id: number) {
    if (id < 0) {
      setRecords(prev => prev.filter(r => r.id !== id))
      return
    }
    await deleteSalary(token, id)
    setRecords(prev => prev.filter(r => r.id !== id))
  }


  async function duplicate(id: number) {
    const src = records.find(r => r.id === id)
    if (!src) return
    const clone: Salary = {
      ...src,
      id: -Date.now(),
      detail: src.detail ? `${src.detail} (copia)` : 'copia',
    }
    setRecords(prev => [clone, ...prev])
    const res = await addSalary(token, {
      user_id: clone.user_id,
      salarie: String(clone.salarie ?? '0'),
      detail: clone.detail,
      date: clone.date,
    })
    const newId = Number(res?.id ?? Date.now())
    setRecords(prev => prev.map(r => r.id === clone.id ? { ...clone, id: newId } : r))
    return newId
  }

  return { records, create, upsert, remove, duplicate }
}