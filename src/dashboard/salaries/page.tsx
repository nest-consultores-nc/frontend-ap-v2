import { useEffect, useState } from 'react'
import { IUserCSV, IUsers } from '../../interfaces/users/users.interface'
import { getAllUsers } from '../../api/users'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import { useNavigate } from 'react-router-dom'
import { getCurrentDate } from '../../functions/getCurrentDate'
import { ISalaries } from '../../interfaces/salaries/salaries.interface'
import {
  Alerts,
  SubmitButtonsCsv,
  TableUploadSalaries,
  HeaderPages,
} from '../../components'
import { createSalarieQuery } from '../../api/salaries/post-salaries'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'

export default function SalariesPage() {
  const [loading, setLoading] = useState<boolean>(true)
  console.log(loading)
  const [salaries, setSalaries] = useState<ISalaries[]>([])
  const [users, setUsers] = useState<IUsers[]>([])
  const [alert, setAlert] = useState(false)
  const [error, setError] = useState({
    success: false,
    msg: '',
  })

  const navigate = useNavigate()

  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

  const handleDownloadCSV = () => {
    const { currentDate } = getCurrentDate()

    // Formatear la fecha como AAAA-MM-DD

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
        date: user.date!,
      })
    )

    const csv = Papa.unparse(csvData)

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }) // Aseguramos UTF-8
    saveAs(blob, `sueldos-${formattedMonthYear}.csv`)
  }

  const handleSubmit = async () => {
    try {
      const response = await createSalarieQuery(
        salaries,
        localStorage.getItem('token')!
      )
      console.log(response)
      setError({
        success: response.success,
        msg: response.msg,
      })
      setAlert(true)
      setSalaries([])
    } catch (error) {
      console.log(error)
      setAlert(true)

      setError({
        success: false,
        msg: 'Ha ocurrido al intentar agregar los salarios.',
      })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data: IUsers[] = await getAllUsers(
          `users-api/obtener-usuarios`,
          localStorage.getItem('token')!
        )
        setUsers(data)
      } catch (error) {
        setError({
          success: false,
          msg: 'Ha ocurrido un error al traer a los usuarios',
        })
        setAlert(true)
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
        skipEmptyLines: true,
        complete: (result) => {
          console.log('Raw parsed data:', result.data)

          const updatedData = result.data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((row: any) => {
              if (row.user_id && row.salarie) {
                return {
                  user_id: row.user_id,
                  salarie: row.salarie,
                  detail: row.detail,
                  date: row.date,
                  //date: row.date,
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
            setError({
              success: false,
              msg: 'Revisa nuevamente el archivo CSV y recuerda que "user_id" y "salarie" son obligatorios.',
            })
            console.log(error)
            setAlert(true)
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
      {alert && (
        <Alerts
          message={
            error.success === false
              ? 'Ha ocurrido un error: '
              : 'Registro Exitoso:'
          }
          success={error.success}
          subtitle={error.msg}
          close={() => setAlert(false)}
        />
      )}
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
        <TableUploadSalaries salaries={salaries} />
      </div>

      <SubmitButtonsCsv
        handleDownloadCSV={handleDownloadCSV}
        handleSubmit={handleSubmit}
        hasData={salaries.length > 0}
      />
    </form>
  )
}
