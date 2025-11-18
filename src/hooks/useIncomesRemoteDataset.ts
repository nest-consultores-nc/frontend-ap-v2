// src/hooks/useIncomesRemoteDataset.ts
import { useEffect, useState } from 'react'
import * as IncomeRead from '../api/income/read'
import * as IncomeMutate from '../api/income/mutate'
import type { IIncome } from '../interfaces/income/income.interface' // <-- usa tu interfaz

// Extendemos IIncome con 'id' para el registro local
export type Income = IIncome & { id: number }

type Options = { token: string }

function validateBeforeSend(i: Income) {
  const errs: string[] = []
  if (!i.month || String(i.month).trim() === '') errs.push('Mes (YYYY-MM)')
  if (!i.date) errs.push('Fecha')
    const nAmount = Number(String(i.amount).replace(/[^\d.-]/g,''))
    if (!Number.isFinite(nAmount) || nAmount < 0) errs.push('Monto (≥ 0)')

    if (!i.month || String(i.month).trim() === '') errs.push('Mes (YYYY-MM)')

  if (!i.temporalities_id) errs.push('Temporalidad')
  if (i.project_id == null) errs.push('Proyecto')
  if (!i.detail || !String(i.detail).trim()) errs.push('Detalle')
  return errs
}


export function useIncomesRemoteDataset({ token }: Options) {
  const [records, setRecords] = useState<Income[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data } = await IncomeRead.getIncomes(token, { limit: 500, offset: 0 })
        if (!cancelled) {
          // asume que la API ya devuelve snake_case; mapea agregando id
          setRecords((data as any[]).map((r) => r as Income))
        }
      } catch {
        if (!cancelled) setRecords([])
      }
    }
    if (token) load()
    return () => { cancelled = true }
  }, [token])

  async function create() {
    const now = new Date()
    const curYM = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`

    const temp: Income = {
    id: -Date.now(),
    amount: '0',
    date: `${curYM}-01`,
    detail: '',
    temporalities_id: 1,
    project_id: 1,
    month: curYM,       // 👈 nunca vacío
    uf: '0',
    }

    setRecords(prev => [temp, ...prev])
    return temp.id
  }

  async function upsert(data: Income) {
    const missing = validateBeforeSend(data)
    if (missing.length) throw new Error(`Faltan: ${missing.join(', ')}`)

    if (data.id < 0) {
      const res = await IncomeMutate.addIncome(token, data)   // 👈 ahora pasa IIncome
      const newId = res.id
      setRecords(prev => {
        const next = prev.filter(r => r.id !== data.id)
        return [{ ...data, id: newId }, ...next]
      })
      return newId
    }

    await IncomeMutate.updateIncome(token, data.id, data)     // 👈 IIncome
    setRecords(prev => prev.map(r => r.id === data.id ? { ...data } : r))
    return data.id
  }

  async function remove(id: number) {
    if (id < 0) {
      setRecords(prev => prev.filter(r => r.id !== id))
      return
    }
    await IncomeMutate.deleteIncome(token, id)
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  async function duplicate(id: number) {
    const src = records.find(r => r.id === id)
    if (!src) return
    const clone: Income = { ...src, id: -Date.now(), detail: src.detail ? `${src.detail} (copia)` : 'copia' }
    setRecords(prev => [clone, ...prev])
    const res = await IncomeMutate.addIncome(token, clone)    // 👈 IIncome
    setRecords(prev => prev.map(r => r.id === clone.id ? { ...clone, id: res.id } : r))
    return res.id
  }

  return { records, create, upsert, remove, duplicate }
}
