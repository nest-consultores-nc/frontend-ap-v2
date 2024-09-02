import { useEffect, useState } from 'react'
import { IProject } from '../../interfaces/projects/projects.interface'
import {
  IDedicationsByUserId,
  ITableDedications,
} from '../../interfaces/dedications/dedications.interfaces'
import { convertDateFormat } from '../../functions/convertDateFormat'
import { insertDedication } from '../../api/dedications/post-dedication'
import { editDedicationQuery } from '../../api/dedications/patch-dedication'
import { deleteDedicationByIdQuery } from '../../api/dedications/delete-dedications'
import { getProjectsAndActivities } from '../../api/projects/get-projects'
import {
  getDedicationsNotConsolidated,
  getHistoryDedicationsByUserId,
} from '../../api/dedications/get-dedications'
import { getMondaysOfCurrentAndPreviousMonth } from '../../functions/getMondaysOfCurrentAndPreviousMonth'
import {
  Alerts,
  ButtonsSubmits,
  TableDedications,
  TableHistoryDedications,
  TabsTableDedications,
} from '../../components'
import HeaderPages from '../../components/HeaderPages/HeaderPages'

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzbHVnIjoiYWRtaW4iLCJuYW1lIjoiTmVzdCBBZG1pbiIsImVtYWlsIjoibmVzdEBhZ2VuY2lhcG9sdXguY2wiLCJpYXQiOjE3MjMzOTY0MTAsImV4cCI6MTcyNTk4ODQxMH0.MHTE95G-OdsjKwzyJmqLPGJJrjwzZ41R0SpUYmAcsz0'

export default function Dedications() {
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(false)
  const [error, setError] = useState({
    success: false,
    msg: '',
  })
  const [projects, setProjects] = useState<IProject[]>([])
  const [activeTab, setActiveTab] = useState('registrar-horas')
  const [weeks, setWeeks] = useState<string[]>([])
  const [dedicationsNotConsolidated, setDedicationsNotConsolidated] = useState<
    IDedicationsByUserId[]
  >([])
  const [editingDedication, setEditingDedication] =
    useState<IDedicationsByUserId | null>(null)

  const [historyDedications, setHistoryDedications] = useState<
    ITableDedications[]
  >([])

  const [dedicationData, setDedicationData] = useState({
    user_id: '9',
    project_id: '',
    week: '',
    dedicated: 0,
    consolidation: 0,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setDedicationData((prev) => ({
      ...prev,
      [name]: name === 'dedicated' ? parseFloat(value) : value,
    }))
  }

  const handleAddDedication = async () => {
    try {
      dedicationData.week = convertDateFormat(dedicationData.week)
      dedicationData.dedicated = dedicationData.dedicated / 100

      const response = await insertDedication(dedicationData, token)

      if (response.success) {
        setAlert(true)
        setError({
          success: true,
          msg: 'Dedicación registrada correctamente',
        })
        setDedicationData({
          user_id: '9',
          project_id: '',
          week: '',
          dedicated: 0,
          consolidation: 0,
        })
      } else {
        setAlert(true)
        setError({
          success: false,
          msg: response.msg,
        })
      }

      if (activeTab === 'registrar-horas') {
        await fetchDataDedications()
      } else {
        await fetchHistoryDedications()
      }
    } catch (error) {
      console.log(error)
      setAlert(true)
      setError({
        success: false,
        msg: 'Ha ocurrido un error inesperado',
      })
    }
  }
  const handleChangeActiveTab = (tab: string) => {
    setActiveTab(tab)
  }

  const handleEditDedication = (dedication: IDedicationsByUserId) => {
    setEditingDedication({
      ...dedication,
      week: convertDateFormat(dedication.week),
    })
  }

  const handleSaveEditDedication = async (
    updatedDedication: IDedicationsByUserId
  ) => {
    try {
      const dedicationUpdateData = {
        id: updatedDedication.id,
        week: convertDateFormat(updatedDedication.week),
        dedicated: updatedDedication.dedicated / 100,
      }

      const response = await editDedicationQuery(dedicationUpdateData, token)
      if (activeTab === 'registrar-horas') {
        if (response.success) {
          await fetchDataDedications()

          setEditingDedication(null)
          setAlert(true)
          setError({
            success: true,
            msg: 'Dedicación actualizada correctamente',
          })

          setDedicationData({
            user_id: '9',
            project_id: '',
            week: '',
            dedicated: 0,
            consolidation: 0,
          })
        } else {
          throw new Error(response.msg)
        }
      } else {
        await fetchHistoryDedications()
      }
    } catch (error) {
      console.log(error)
      setAlert(true)
      setError({
        success: false,
        msg: 'Error al actualizar la dedicación',
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingDedication(null)
  }

  const handleDeleteDedication = async (dedicationId: number) => {
    try {
      await deleteDedicationByIdQuery(
        dedicationId,
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzbHVnIjoiYWRtaW4iLCJuYW1lIjoiTmVzdCBBZG1pbiIsImVtYWlsIjoibmVzdEBhZ2VuY2lhcG9sdXguY2wiLCJpYXQiOjE3MjMzOTY0MTAsImV4cCI6MTcyNTk4ODQxMH0.MHTE95G-OdsjKwzyJmqLPGJJrjwzZ41R0SpUYmAcsz0' // Token de autenticación
      )
      setAlert(true)
      setError({
        success: true,
        msg: 'Dedicación eliminada correctamente',
      })

      if (activeTab === 'registrar-horas') {
        await fetchDataDedications()
      } else {
        await fetchHistoryDedications()
      }
    } catch (error) {
      console.error('Error eliminando dedicación:', error)
      setAlert(true)
      setError({
        success: false,
        msg: 'Error al eliminar la dedicación',
      })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getProjectsAndActivities(
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzbHVnIjoiYWRtaW4iLCJuYW1lIjoiTmVzdCBBZG1pbiIsImVtYWlsIjoibmVzdEBhZ2VuY2lhcG9sdXguY2wiLCJpYXQiOjE3MjMzOTY0MTAsImV4cCI6MTcyNTk4ODQxMH0.MHTE95G-OdsjKwzyJmqLPGJJrjwzZ41R0SpUYmAcsz0' // Token de autenticación
        )
        setProjects(data?.projects || [])
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchDataDedications = async () => {
    setLoading(true)
    try {
      const data = await getDedicationsNotConsolidated(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzbHVnIjoiYWRtaW4iLCJuYW1lIjoiTmVzdCBBZG1pbiIsImVtYWlsIjoibmVzdEBhZ2VuY2lhcG9sdXguY2wiLCJpYXQiOjE3MjMzOTY0MTAsImV4cCI6MTcyNTk4ODQxMH0.MHTE95G-OdsjKwzyJmqLPGJJrjwzZ41R0SpUYmAcsz0',
        9
      )

      setDedicationsNotConsolidated(data?.dedications || [])
    } catch (error) {
      console.error('Error fetching dedications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistoryDedications = async () => {
    setLoading(true)
    try {
      const data = await getHistoryDedicationsByUserId(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzbHVnIjoiYWRtaW4iLCJuYW1lIjoiTmVzdCBBZG1pbiIsImVtYWlsIjoibmVzdEBhZ2VuY2lhcG9sdXguY2wiLCJpYXQiOjE3MjMzOTY0MTAsImV4cCI6MTcyNTk4ODQxMH0.MHTE95G-OdsjKwzyJmqLPGJJrjwzZ41R0SpUYmAcsz0',
        9
      )
      console.log(data)
      setHistoryDedications(data?.dedications || [])
    } catch (error) {
      console.error('Error fetching history dedications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDataDedications()
  }, [alert])

  useEffect(() => {
    const weeksData = getMondaysOfCurrentAndPreviousMonth()
    setWeeks(weeksData)
  }, [])

  useEffect(() => {
    fetchHistoryDedications()
  }, [])

  const handleCloseAlert = () => {
    setAlert(false)
  }

  const [canFinish, setCanFinish] = useState(false)

  const handleFinish = async () => {
    if (canFinish) {
      await fetchDataDedications()
    }
  }

  return (
    <>
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
            close={handleCloseAlert}
          />
        )}
        <HeaderPages
          titlePage="Agregar Dedicaciones"
          subTitlePage="Ingresa los porcentajes de dedicación semanal destinada a cada proyecto o actividad"
        />

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Nombre del Colaborador
            </label>
            <div className="mt-2">
              <input
                type="text"
                className="block w-full rounded-md px-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Ingresa el nombre del proyecto"
                disabled
              />
            </div>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Seleccione el Proyecto
            </label>
            <div className="mt-2">
              <select
                value={dedicationData.project_id}
                onChange={handleChange}
                name="project_id"
                className="block w-full rounded-md px-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="" disabled>
                  Seleccione un proyecto
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.client_name} - {project.project_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Seleccione la Semana
            </label>
            <div className="mt-2">
              <select
                name="week"
                className="block w-full rounded-md px-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={dedicationData.week}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Seleccione la semana
                </option>
                {weeks.map((week, index) => (
                  <option key={index} value={week}>
                    {week}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Porcentaje de Dedicación
            </label>
            <div className="mt-2">
              <input
                type="number"
                name="dedicated"
                value={dedicationData.dedicated}
                onChange={handleChange}
                className="block w-full rounded-md px-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Ingrese el porcentaje de dedicación"
              />
            </div>
          </div>
        </div>
      </form>

      {loading ? (
        <p>Cargando... </p>
      ) : (
        <div className="my-10">
          <TabsTableDedications
            active={activeTab}
            handleChangeActiveTab={handleChangeActiveTab}
          />
          {activeTab === 'registrar-horas' ? (
            <>
              <TableDedications
                weeks={weeks}
                dedications={dedicationsNotConsolidated}
                onEditDedication={handleEditDedication}
                onDeleteDedication={handleDeleteDedication}
                editingDedication={editingDedication}
                onSaveEditDedication={handleSaveEditDedication}
                onCancelEdit={handleCancelEdit}
                setCanFinish={setCanFinish}
              />
              <ButtonsSubmits
                onAdd={handleAddDedication}
                canFinish={canFinish}
                onFinish={handleFinish}
              />
            </>
          ) : (
            <TableHistoryDedications historyDedications={historyDedications} />
          )}
        </div>
      )}
    </>
  )
}
