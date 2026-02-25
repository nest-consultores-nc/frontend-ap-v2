import { useEffect, useState } from 'react'

export type HistoryEntry<T> = {
  id: string
  at: number 
  data: T
  note?: string
}

type UseHistoryStoreOpts<T> = {
  storageKey: string     
  seed: T              
}

export function useHistoryStore<T>({ storageKey, seed }: UseHistoryStoreOpts<T>) {
  const [current, setCurrent] = useState<T>(seed)
  const [history, setHistory] = useState<HistoryEntry<T>[]>([])
  const [prevStorageKey, setPrevStorageKey] = useState<string>(storageKey)

  useEffect(() => {

    const oldId = prevStorageKey.split(':')[1]
    const newId = storageKey.split(':')[1]
    const isTransitionFromNew = oldId === '-1' && newId !== '-1' && newId !== oldId

    if (isTransitionFromNew) {
    
      const oldRaw = localStorage.getItem(prevStorageKey)
      if (oldRaw) {
        const oldData = JSON.parse(oldRaw)
        localStorage.setItem(storageKey, JSON.stringify({
          current: seed,
          history: oldData.history ?? []
        }))
        localStorage.removeItem(prevStorageKey)
      }
    }

    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const parsed = JSON.parse(raw)
      setCurrent(parsed.current ?? seed)
      setHistory(parsed.history ?? [])
    } else {
      const first: HistoryEntry<T> = {
        id: crypto.randomUUID(),
        at: Date.now(),
        data: seed,
        note: 'Versión inicial'
      }
      setHistory([first])
      setCurrent(seed)
    }

    setPrevStorageKey(storageKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ current, history }))
  }, [current, history, storageKey])

  const saveVersion = (note?: string) => {
    const entry: HistoryEntry<T> = {
      id: crypto.randomUUID(),
      at: Date.now(),
      data: current,
      note
    }
    setHistory(prev => [entry, ...prev])
  }

  const revertTo = (id: string) => {
    const target = history.find(h => h.id === id)
    if (!target) return
    setCurrent(target.data)
    const entry: HistoryEntry<T> = {
      id: crypto.randomUUID(),
      at: Date.now(),
      data: target.data,
      note: `Revertido a versión de ${new Date(target.at).toLocaleString()}`
    }
    setHistory(prev => [entry, ...prev])
  }

 

  return { current, setCurrent, history, saveVersion, revertTo  }
}
