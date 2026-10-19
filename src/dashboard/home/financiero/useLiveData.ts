import { useCallback, useEffect, useRef, useState } from 'react'

/** Cada cuánto se vuelve a consultar la base mientras la pestaña está visible */
export const REFRESH_MS = 60_000

/**
 * Carga los datos del dashboard y los mantiene al día:
 * - refresco automático cada minuto, solo con la pestaña visible
 * - refresco inmediato al volver a la pestaña si pasó más de un minuto
 * - `refresh()` para el botón manual
 * Mientras recarga se conservan los datos anteriores (sin parpadeo).
 */
export function useLiveData<T>(fetcher: (token: string, signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  // El fetcher se guarda en una ref para no reiniciar el refresco si cambia su identidad
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const controller = useRef<AbortController | null>(null)
  const lastFetch = useRef(0)

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Sesión no válida. Vuelve a iniciar sesión.')
      return
    }

    controller.current?.abort()
    const ctrl = new AbortController()
    controller.current = ctrl
    lastFetch.current = Date.now()
    setLoading(true)

    try {
      const result = await fetcherRef.current(token, ctrl.signal)
      setData(result)
      setError(null)
      setUpdatedAt(new Date())
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      setError((e as Error).message || 'No se pudieron cargar los datos')
    } finally {
      if (controller.current === ctrl) setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, REFRESH_MS)

    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastFetch.current > REFRESH_MS) {
        refresh()
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      controller.current?.abort()
    }
  }, [refresh])

  return { data, error, loading, updatedAt, refresh }
}
