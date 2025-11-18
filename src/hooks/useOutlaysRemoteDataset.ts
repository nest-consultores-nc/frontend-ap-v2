import { useCallback, useEffect, useState } from 'react'
import * as OutlayRead from '../api/outlay/read'
import * as OutlayMutate from '../api/outlay/mutate'

export type Outlay = {
  id: number
  amount: number
  date: string
  detail: string | null
  outlay_temporalities_id: number
  outlay_types_id: number
  outlay_category_id: number | null
  project_id: number | null
}

type Options = { token: string }

function toBackendPayload(o: Outlay) {
  const typeId = o.outlay_types_id
  const projectOrCategoryId = typeId === 1 ? o.project_id : o.outlay_category_id

  return {
    amount: Number(o.amount),
    date: o.date, // 'YYYY-MM-DD'
    detail: o.detail ?? '',
    temporalityId: o.outlay_temporalities_id,
    typeId,
    projectOrCategoryId,
  }
}

export function useOutlaysRemoteDataset({ token }: Options) {
  const [records, setRecords] = useState<Outlay[]>([])

  // ---- helpers de error
  const isStatus = (e: unknown, code: number) =>
    (e as any)?.status === code ||
    (e as any)?.response?.status === code ||
    `${(e as any)?.message ?? ''}`.includes(String(code))
  const is404 = (e: unknown) => isStatus(e, 404)
  const is409 = (e: unknown) => isStatus(e, 409)

  // ---- fetchAll y carga inicial
  const fetchAll = useCallback(async () => {
    const res = await OutlayRead.getOutlays(token, { limit: 500, offset: 0 })
    setRecords(res.data as Outlay[])
  }, [token])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await OutlayRead.getOutlays(token, { limit: 500, offset: 0 })
        if (mounted) setRecords(res.data as Outlay[])
      } catch {
        if (mounted) setRecords([])
      }
    })()
    return () => { mounted = false }
  }, [token])

  // ---- crea draft local
  const create = () => {
    const tempId = -Date.now()
    const draft: Outlay = {
      id: tempId,
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      detail: '',
      outlay_temporalities_id: 1,
      outlay_types_id: 2,
      outlay_category_id: null,
      project_id: null,
    }
    setRecords(prev => [draft, ...prev])
    return tempId
  }

  // ---- persistencia
  const createOutlay = async (o: Outlay) => {
    const payload = toBackendPayload(o)
    const res = await OutlayMutate.addOutlay(token, payload as any)
    const newId = (res as any)?.id as number
    // Recarga todo para evitar estados inconsistentes
    await fetchAll()
    return newId
  }

  const updateOutlay = async (o: Outlay) => {
    if (!o.id || o.id < 1) throw new Error('No hay ID válido para actualizar.')
    const payload = toBackendPayload(o)
    await OutlayMutate.updateOutlay(token, o.id, payload as any)
    // Mantén la UI sincronizada (recarga todo)
    await fetchAll()
    return o.id
  }

  const upsert = async (o: Outlay) => {
    const hasId = Number(o?.id) > 0
    try {
      return hasId ? await updateOutlay(o) : await createOutlay(o)
    } catch (e) {
      if (hasId && is404(e)) return await createOutlay(o)
      if (!hasId && is409(e)) return await updateOutlay(o)
      throw e
    }
  }

  const remove = async (id: number) => {
    if (id < 0) { // draft local
      setRecords(prev => prev.filter(r => r.id !== id))
      return
    }
    await OutlayMutate.deleteOutlay(token, id)
    await fetchAll() // asegura consistencia y evita parpadeos
  }

  // ---- duplicar (B2): POST + recarga completa (sin GET inmediato al nuevo id)
  const duplicate = async (id: number) => {
    const base = records.find(r => r.id === id)
    if (!base) return null

    const payload = toBackendPayload({ ...base })
    const res = await OutlayMutate.addOutlay(token, payload as any)
    const newId = (res as any)?.id as number

    // Evita 404 por eventual consistency → recargar todo
    await fetchAll()

    return newId
  }

  return { records, upsert, remove, duplicate, create, reload: fetchAll }
}
