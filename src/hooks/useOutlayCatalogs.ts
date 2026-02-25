import { useEffect, useMemo, useState } from 'react'
import * as OutlayRead from '../api/outlay/read'
import { getAllProjects } from '../api/projects/get-projects'  

type Project = { id: number; project_name?: string; name?: string }

export function useOutlayCatalogs(token: string) {
  const [types, setTypes] = useState<any[]>([])
  const [temporalities, setTemporalities] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
   
        const tts = await OutlayRead.getAllOutlayData(token, '1', 'admin@demo.com')
    
        const cats = await OutlayRead.getOutlayCategoriesQuery(token)
 
        const projs = await getAllProjects(token, true)

        if (!mounted) return
        setTypes(tts.outlayTypes ?? [])
        setTemporalities(tts.outlayTemporalities ?? [])
        setCategories(cats.outlayCategories ?? [])
        setProjects(projs.projects ?? [])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [token])

  const categoriesById = useMemo(() => {
    const m = new Map<number, string>()
    categories.forEach((c: any) => m.set(c.id, c.name))
    return m
  }, [categories])

  const projectsById = useMemo(() => {
    const m = new Map<number, string>()
    projects.forEach((p: Project) => m.set(p.id as number, (p.project_name ?? p.name ?? '').toString()))
    return m
  }, [projects])

  const temporalityOptions = useMemo(
    () => temporalities.map((t: any) => ({ label: `${t.name}`, value: t.id })),
    [temporalities]
  )

  const typeOptions = useMemo(
    () => types.map((t: any) => ({ label: `${t.name}`, value: t.id })),
    [types]
  )

  const categoryOptions = useMemo(
    () => categories.map((c: any) => ({ label: c.name, value: c.id })),
    [categories]
  )

  const projectOptions = useMemo(
    () => projects.map((p: Project) => ({ label: (p.project_name ?? p.name ?? '').toString(), value: p.id as number })),
    [projects]
  )

  return {
    loading,
    categoriesById,
    projectsById,
    temporalityOptions,
    typeOptions,
    categoryOptions,
    projectOptions,
  }
}
