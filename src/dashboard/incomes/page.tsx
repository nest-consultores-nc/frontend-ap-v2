import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'
import { IProject } from '../../interfaces/projects/projects.interface'
import { getAllProjects } from '../../api/projects/get-projects'
import { useNavigate } from 'react-router-dom'
import { Alerts, HeaderPages } from '../../components'
import { TableUploadIncomes } from '../../components/TableUploadIncomes/TableUploadIncomes'
import { IIncome } from '../../interfaces/income/income.interface'
import { createIncomeQuery } from '../../api/income/post-income'
import { SubmitButtonsCsv } from '../../components/SubmitButtonsCsv/SubmitButtonsCsv'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'

export default function IncomesPage() {
  const [loading, setLoading] = useState<boolean>(true)
  const [projectsAndActivities, setProjectsAndActivities] = useState<
    IProject[]
  >([])
  const [projectsIncome, setProjectsIncome] = useState<IIncome[]>([])
  const [alert, setAlert] = useState(false)
  const [error, setError] = useState({
    success: false,
    msg: '',
  })
  console.log(projectsAndActivities, loading, error)
  const navigate = useNavigate()

  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { projects } = await getAllProjects(
          localStorage.getItem('token')!,
          true
        )
        setProjectsAndActivities(projects)
      } catch (error) {
        setError({
          success: false,
          msg: 'Ha ocurrido un error al intentar traer los datos desde la base de datos',
        })
        setAlert(true)
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async () => {
    try {
      const response = await createIncomeQuery(
        projectsIncome,
        localStorage.getItem('token')!
      )
      console.log(response)
      setError({
        success: true,
        msg: response.msg,
      })
      setAlert(true)
      setProjectsIncome([])
    } catch (error) {
      console.log(error)
      setAlert(true)
      setError({
        success: false,
        msg: 'Ha ocurrido al intentar agregar los salarios.',
      })
    }
  }

  const handleDownloadCSV = () => {
    if (!Array.isArray(projectsAndActivities)) {
      console.error('projectsAndActivities is not an array')
      return
    }

    const currentDate = new Date()
    const firstDayOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    )

    const formattedDate = firstDayOfCurrentMonth.toISOString().split('T')[0]
    const monthOptions: Intl.DateTimeFormatOptions = { month: 'short' }
    const formattedMonth = new Intl.DateTimeFormat('es-ES', monthOptions)
      .format(currentDate)
      .toLowerCase()
      .replace('.', '')

    const formattedYear = currentDate.getFullYear().toString().slice(-2)
    const formattedMonthYear = `${formattedMonth}-${formattedYear}`

    const csvData = projectsAndActivities.map(
      (project): IIncome => ({
        detail: project.project_name + ' - ' + project.client.clientName,
        amount: '',
        uf: '0.00',
        date: formattedDate,
        project_id: project.id,
        temporalities_id: '',
        month: formattedMonthYear,
      })
    )

    const csv = Papa.unparse(csvData)
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `incomes-${formattedMonthYear}.csv`)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          console.log('Raw parsed data:', result.data)

          const currentDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
          const updatedData = result.data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((row: any) => {
              if (
                row.project_id &&
                row.date &&
                row.temporalities_id &&
                row.amount
              ) {
                return {
                  detail: row.detail,
                  amount: row.amount,
                  uf: row.uf,
                  project_id: Number(row.project_id),
                  date: row.date,
                  temporalities_id: row.temporalities_id,
                  month: row.month,
                  created_at: currentDate,
                }
              } else {
                return null
              }
            })
            .filter(Boolean)

          if (updatedData.length > 0) {
            setProjectsIncome(updatedData as IIncome[])
          } else {
            setError({
              success: false,
              msg: 'Revisa nuevamente el archivo CSV y recuerda que "project_id", "date", "temporalities_id" y "amount" son obligatorios.',
            })
            console.log(error)
            setAlert(true)
          }
        },
        error: (error) => {
          setError({
            success: false,
            msg: 'Revisa nuevamente el archivo CSV y recuerda que "project_id", "date" y "temporalities_id" son obligatorios.',
          })
          console.log(error)
          setAlert(true)
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
        <TableUploadIncomes projectsIncome={projectsIncome} />
      </div>

      <SubmitButtonsCsv
        handleDownloadCSV={handleDownloadCSV}
        handleSubmit={handleSubmit}
        hasData={projectsIncome.length > 0}
      />
    </form>
  )
}
