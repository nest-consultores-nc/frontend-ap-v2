import { useEffect, useMemo, useState } from 'react'
import { getAllUsers } from '../api/users'    
import type { IUsers } from '../interfaces/users/users.interface'

const USERS_PATH = 'users-api/obtener-usuarios'          

export function useUsersCatalog(token: string) {
  const [users, setUsers] = useState<IUsers[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!token) { setUsers([]); return }
      setLoading(true)
      try {
        const data = await getAllUsers(USERS_PATH, token)     
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

  const usersById = useMemo(() => {
    const m = new Map<number, string>()
    for (const u of users) {
   
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
