// NUEVO
import { useEffect, useMemo, useState } from 'react'
import { getAllUsers } from '../api/users'         // 👈 tu index.ts exporta esta función
import type { IUsers } from '../interfaces/users/users.interface'

// Ajusta solo esta constante si tu endpoint difiere:
const USERS_PATH = 'users-api/obtener-usuarios'               // p.ej. 'usuarios/get-users' o 'user/list'

export function useUsersCatalog(token: string) {
  const [users, setUsers] = useState<IUsers[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!token) { setUsers([]); return }
      setLoading(true)
      try {
        const data = await getAllUsers(USERS_PATH, token)      // 👈 usa tu función tal cual
        if (!cancelled) setUsers(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setUsers([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])

  // id -> etiqueta legible
  const usersById = useMemo(() => {
    const m = new Map<number, string>()
    for (const u of users) {
      // intenta varios campos comunes para el label
      const id = Number((u as any).id ?? (u as any).user_id)
      const label =
        (u as any).name ??
        (u as any).full_name ??
        (u as any).username ??
        (u as any).email ??
        `ID ${id}`
      if (Number.isFinite(id)) m.set(id, String(label))
    }
    return m
  }, [users])

  // opciones para <select>
  const userOptions = useMemo(() => {
    return users.map((u) => {
      const id = Number((u as any).id ?? (u as any).user_id)
      const label =
        (u as any).name ??
        (u as any).full_name ??
        (u as any).username ??
        (u as any).email ??
        `ID ${id}`
      return { label: String(label), value: id }
    })
  }, [users])

  return { users, userOptions, usersById, loading }
}
