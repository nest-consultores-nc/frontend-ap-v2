import { useEffect, useState } from 'react'
import { IUserCSV, IUsers } from '../../interfaces/users/users.interface'
import { getAllUsers } from '../../api/users'
import HeaderPages from '../../components/HeaderPages/HeaderPages'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'

interface ISalaries {
  user_id: number
  salarie: string | null
  detail: string
  date: string | null
}

export default function SalariesPage() {
  const [loading, setLoading] = useState<boolean>(true)
  const [salaries, setSalaries] = useState<ISalaries[]>([])
  const [users, setUsers] = useState<IUsers[]>([])

  const [error, setError] = useState<string | null>(null)
  console.log(error, loading)
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

    const csvData = users.map(
      (user): IUserCSV => ({
        detail: user.name,
        salarie: null,
        user_id: user.id,
        date: formattedDate,
      })
    )

    const csv = Papa.unparse(csvData)

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }) // Aseguramos UTF-8
    saveAs(blob, `sueldos-${formattedMonthYear}.csv`)
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data: IUsers[] = await getAllUsers(
          `users-api/obtener-usuarios `,
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzbHVnIjoiYWRtaW4iLCJuYW1lIjoiTmVzdCBBZG1pbiIsImVtYWlsIjoibmVzdEBhZ2VuY2lhcG9sdXguY2wiLCJpYXQiOjE3MjMzOTY0MTAsImV4cCI6MTcyNTk4ODQxMH0.MHTE95G-OdsjKwzyJmqLPGJJrjwzZ41R0SpUYmAcsz0'
        )
        console.log(data)
        setUsers(data)
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
          console.log('Raw parsed data:', result.data)

          const currentDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
          const updatedData = result.data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((row: any) => {
              if (row.user_id && row.salarie) {
                return {
                  user_id: row.user_id,
                  salarie: row.salarie,
                  detail: row.detail,
                  date: currentDate,
                }
              } else {
                return null
              }
            })
            .filter(Boolean)

          console.log('Processed data:', updatedData)

          if (updatedData.length > 0) {
            setSalaries(updatedData as ISalaries[])
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
        titlePage="Registrar Sueldos"
        subTitlePage="Por favor, ingresa los datos en los campos correspondientes."
      />

      <label className="block text-sm font-medium text-gray-900">
        Subir Archivo .csv
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
                user_id
              </th>
              <th scope="col" className="px-6 py-3 w-1/6">
                salarie
              </th>
              <th scope="col" className="px-6 py-3 w-1/6">
                detail
              </th>
              <th scope="col" className="px-6 py-3 w-1/6">
                date
              </th>
            </tr>
          </thead>
          <tbody>
            {salaries &&
              salaries.map((user, index) => (
                <tr key={index} className="bg-white border-b">
                  <td className="px-6 py-4">{user.user_id}</td>
                  <td className="px-6 py-4">{user.detail}</td>
                  <td className="px-6 py-4">{user.salarie}</td>
                  <td className="px-6 py-4">{user.date}</td>
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
