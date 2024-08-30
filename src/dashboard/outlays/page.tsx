'use client'

import Papa from 'papaparse'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { IProject } from '../../interfaces/projects/projects.interface'
import { getAllProjects } from '../../api/projects/get-projects'
import HeaderPages from '../../components/HeaderPages/HeaderPages'

// Definición de interfaces para los datos
interface IOutlay {
  amount: number
  date: string
  detail: string
  outlay_temporalities_id: number | null
  outlay_types_id: number | null
  outlay_category_id: number | null
  project_id: number
}

export default function OutlaysPage() {
  const [loading, setLoading] = useState<boolean>(true)
  const [projectsAndActivities, setProjectsAndActivities] = useState<
    IProject[]
  >([])
  const [projectsOutlays, setProjectsOutlays] = useState<IOutlay[]>([])
  const [error, setError] = useState<string | null>(null)
  console.log(loading, error, projectsAndActivities)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = await getAllProjects(
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzbHVnIjoiYWRtaW4iLCJuYW1lIjoiTmVzdCBBZG1pbiIsImVtYWlsIjoibmVzdEBhZ2VuY2lhcG9sdXguY2wiLCJpYXQiOjE3MjMzOTY0MTAsImV4cCI6MTcyNTk4ODQxMH0.MHTE95G-OdsjKwzyJmqLPGJJrjwzZ41R0SpUYmAcsz0',
          true
        )
        setProjectsAndActivities(data) // Asumimos que 'data' es un arreglo de proyectos
      } catch (error) {
        setError('Error fetching projects')
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true, // Saltar las líneas vacías
        complete: (result) => {
          console.log('Raw parsed data:', result.data) // Log para inspeccionar los datos sin procesar

          const currentDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
          const updatedData = result.data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((row: any) => {
              if (row.date && row.amount) {
                return {
                  outlay_temporalities_id: row.outlay_temporalities_id,
                  outlay_types_id: row.outlay_types_id,
                  outlay_category_id: row.outlay_category_id,
                  detail: row.detail,
                  amount: row.amount,
                  uf: row.uf,
                  project_id: row.project_id,
                  date: row.date,
                  created_at: currentDate,
                }
              } else {
                return null
              }
            })
            .filter(Boolean)

          console.log('Processed data:', updatedData) // Verificamos los datos procesados

          if (updatedData.length > 0) {
            setProjectsOutlays(updatedData as IOutlay[]) // Actualizamos el estado solo si hay datos
          } else {
            console.error('No valid data found in CSV')
          }
        },
        error: (error) => {
          console.error('Error reading CSV file:', error)
        },
      })
    } else {
      console.error('Please upload a valid CSV file.')
    }
  }

  return (
    <form>
      <HeaderPages
        titlePage="Registrar Desembolsos"
        subTitlePage="Por favor, ingresa los datos en los campos correspondientes."
      />

      <label className="block text-sm font-medium text-gray-900">
        Subir Archivo .CSV
      </label>
      <div className="flex justify-between">
        <input
          className="block w-full text-sm p-2 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          id="file_input"
          type="file"
          onChange={handleFileUpload} // Vinculamos la función
        />
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 w-1/6">
                detail
              </th>
              <th scope="col" className="px-6 py-3 w-1/6">
                amount
              </th>
              <th scope="col" className="px-6 py-3 w-1/6">
                date
              </th>
              <th scope="col" className="px-6 py-3 w-1/6">
                project_id
              </th>
              <th scope="col" className="px-6 py-3 w-1/6">
                outlay_temporalities_id
              </th>
              <th scope="col" className="px-6 py-3 w-1/6">
                outlay_types_id
              </th>
              <th scope="col" className="px-6 py-3 w-1/6">
                outlay_category_id
              </th>
            </tr>
          </thead>
          <tbody>
            {projectsOutlays &&
              projectsOutlays.map((project, index) => (
                <tr key={index} className="bg-white border-b">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {project.detail}
                  </th>
                  <td className="px-6 py-4">{project.amount}</td>
                  <td className="px-6 py-4">
                    {new Date(project.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{project.project_id}</td>
                  <td className="px-6 py-4">
                    {project.outlay_temporalities_id}
                  </td>
                  <td className="px-6 py-4">{project.outlay_types_id}</td>
                  <td className="px-6 py-4">{project.outlay_category_id}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Guardar
        </button>
      </div>
    </form>
  )
}
