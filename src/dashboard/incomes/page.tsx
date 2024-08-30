'use client'

import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'
import { IProject } from '../../interfaces/projects/projects.interface'
import { getAllProjects } from '../../api/projects/get-projects'
import HeaderPages from '../../components/HeaderPages/HeaderPages'

// Definición de interfaces para los datos
interface IIncomes {
  detail: string
  amount: string
  uf: string
  date: string
  project_id: number
  temporalities_id: string
  month: string
}

export default function IncomesPage() {
  const [loading, setLoading] = useState<boolean>(true)
  const [projectsAndActivities, setProjectsAndActivities] = useState<
    IProject[]
  >([])
  const [projectsOutlays, setProjectsOutlays] = useState<IIncomes[]>([])
  const [error, setError] = useState<string | null>(null)
  console.log(loading, error)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // TODO arreglar any
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

  const handleDownloadCSV = () => {
    const currentDate = new Date()
    const firstDayOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    )

    // Formatear la fecha como AAAA-MM-DD
    const formattedDate = firstDayOfCurrentMonth.toISOString().split('T')[0]

    // Formatear el mes como MMM-AA (en español)
    const monthOptions: Intl.DateTimeFormatOptions = { month: 'short' }
    const formattedMonth = new Intl.DateTimeFormat('es-ES', monthOptions)
      .format(currentDate)
      .toLowerCase()
      .replace('.', '')

    const formattedYear = currentDate.getFullYear().toString().slice(-2) // Obtener los últimos dos dígitos del año
    const formattedMonthYear = `${formattedMonth}-${formattedYear}`

    const csvData = projectsAndActivities.map(
      (project): IIncomes => ({
        detail: project.project_name,
        amount: '', // Placeholder de amount, puedes ajustarlo según tus necesidades
        uf: '0.00',
        date: formattedDate, // AAAA-MM-DD
        project_id: project.id,
        temporalities_id: '', // Placeholder de temporalities_id, ajusta según tus necesidades
        month: formattedMonthYear, // MMM-AA
      })
    )

    const csv = Papa.unparse(csvData)

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }) // Aseguramos UTF-8
    saveAs(blob, `incomes-${formattedMonthYear}.csv`)
  }

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
              if (row.project_id && row.date && row.temporalities_id) {
                return {
                  detail: row.detail,
                  amount: row.amount,
                  uf: row.uf,
                  project_id: Number(row.project_id), // Convertimos a número
                  date: row.date,
                  temporalities_id: row.temporalities_id,
                  month: row.month,
                  created_at: currentDate, // Añadimos la fecha actual
                }
              } else {
                return null
              }
            })
            .filter(Boolean)

          console.log('Processed data:', updatedData) // Verificamos los datos procesados

          if (updatedData.length > 0) {
            setProjectsOutlays(updatedData as IIncomes[]) // Actualizamos el estado solo si hay datos
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
        titlePage="Registrar Ingresos"
        subTitlePage="Por favor, ingresa los datos en los campos correspondientes."
      />

      <label className="block text-sm font-medium text-gray-900">
        Upload file
      </label>
      <div className="flex justify-between">
        <input
          className="block w-full text-sm p-2 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          id="file_input"
          type="file"
          onChange={handleFileUpload}
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
                uf
              </th>
              <th scope="col" className="px-6 py-3 w-1/6">
                date
              </th>
              <th scope="col" className="px-6 py-3 w-1/6">
                project_id
              </th>
              <th scope="col" className="px-6 py-3 w-1/6">
                temporalities_id
              </th>
              <th scope="col" className="px-6 py-3 w-1/6">
                month
              </th>
              <th scope="col" className="px-6 py-3 w-1/6">
                <span className="sr-only">Editar</span>
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
                  <td className="px-6 py-4">{project.amount || '1328571'}</td>
                  <td className="px-6 py-4">{project.uf || '0.00'}</td>
                  <td className="px-6 py-4">
                    {new Date(project.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{project.project_id}</td>
                  <td className="px-6 py-4">
                    {project.temporalities_id || '2'}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(project.date).toLocaleString('default', {
                      month: 'short',
                    }) +
                      '-' +
                      new Date(project.date).getFullYear().toString().slice(-2)}
                  </td>
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
          type="button"
          onClick={handleDownloadCSV}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Descargar CSV
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
