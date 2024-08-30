import { useEffect, useState } from 'react'
import { IProject } from '../../interfaces/projects/projects.interface'
import { getAllProjects } from '../../api/projects/get-projects'
import HeaderPages from '../../components/HeaderPages/HeaderPages'
import {
  LoadingSpinner,
  PaginationProjectsTable,
  ProjectsTable,
} from '../../components'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<IProject[]>([])
  const [showCurrentProjects, setShowCurrentProjects] = useState(true)
  const [loading, setLoading] = useState(true)
  const [totalProjects, setTotalProjects] = useState(0)

  const [currentPage, setCurrentPage] = useState(1)
  const projectsPerPage = 10

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getAllProjects(
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzbHVnIjoiYWRtaW4iLCJuYW1lIjoiTmVzdCBBZG1pbiIsImVtYWlsIjoibmVzdEBhZ2VuY2lhcG9sdXguY2wiLCJpYXQiOjE3MjMzOTY0MTAsImV4cCI6MTcyNTk4ODQxMH0.MHTE95G-OdsjKwzyJmqLPGJJrjwzZ41R0SpUYmAcsz0', // Token de autenticación
          showCurrentProjects
        )
        setProjects(data?.projects || [])
        setTotalProjects(data?.projects?.length || 0)
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [showCurrentProjects])

  const indexOfLastProject = currentPage * projectsPerPage
  const indexOfFirstProject = indexOfLastProject - projectsPerPage
  const currentProjects = projects.slice(
    indexOfFirstProject,
    indexOfLastProject
  )

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <>
      <HeaderPages
        titlePage="Lista de Proyectos"
        subTitlePage="En esta tabla están los datos de todos los proyectos vigentes (también es posible ver los que ya han finalizado)"
      />
      <div className="mt-6 flex items-center justify-end gap-x-6 ">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
          onClick={() => setShowCurrentProjects(!showCurrentProjects)}
        >
          Ver todos
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Agregar dedicación
        </button>
      </div>
      <div className="overflow-x-auto mt-4 ">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <ProjectsTable projects={currentProjects} />
        )}
      </div>
      <PaginationProjectsTable
        totalProjects={totalProjects}
        projectsPerPage={projectsPerPage}
        currentPage={currentPage}
        paginate={paginate}
      />
    </>
  )
}
