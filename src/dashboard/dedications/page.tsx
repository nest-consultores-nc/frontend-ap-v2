import { useEffect, useState } from 'react'
import { IProject } from '../../interfaces/projects/projects.interface'
import {
  IDedicationsByUserId,
  ITableDedications,
} from '../../interfaces/dedications/dedications.interfaces'
import { convertDateFormat } from '../../functions/convertDateFormat'
import { insertDedication } from '../../api/dedications/post-dedication'
import {
  editDedicationQuery,
  updateConsolidationsQuery,
} from '../../api/dedications/patch-dedication'
import { deleteDedicationByIdQuery } from '../../api/dedications/delete-dedications'
import { getProjectsAndActivities } from '../../api/projects/get-projects'
import {
  getDedicationsNotConsolidated,
  getHistoryDedicationsByUserId,
} from '../../api/dedications/get-dedications'
import { getWeeksAround } from '../../functions/getWeeksAround'
import {
  Alerts,
  ButtonsSubmits,
  TableDedications,
  TableHistoryDedications,
  TabsTableDedications,
  HeaderPages,
} from '../../components'
import { useNavigate } from 'react-router-dom'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'



export interface IDedication {
  user_id: number
  project_id: string
  week: string
  dedicated: number
  consolidation: number
}
export default function Dedications() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')!
  const userId = Number(localStorage.getItem('id'))
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<IProject[]>([])
  const [activeTab, setActiveTab] = useState('registrar-horas')
  const [weeks, setWeeks] = useState<string[]>([])
  const [alert, setAlert] = useState(false)
  const [error, setError] = useState({
    success: false,
    msg: '',
  })
  const [dedicationsNotConsolidated, setDedicationsNotConsolidated] = useState<
    IDedicationsByUserId[]
  >([])
  const [editingDedication, setEditingDedication] =
    useState<IDedicationsByUserId | null>(null)

  const [historyDedications, setHistoryDedications] = useState<
    ITableDedications[]
  >([])

  const [dedicationData, setDedicationData] = useState<IDedication>({
    user_id: userId,
    project_id: '',
    week: '',
    dedicated: 0,
    consolidation: 0,
  })


  const [dedicatedInput, setDedicatedInput] = useState<string>('') 


  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    if (name === 'dedicated') {
      
      const onlyDigits = value.replace(/[^\d]/g, '')

      
      if (onlyDigits === '') {
        setDedicatedInput('')
   
        return
      }

      let num = parseInt(onlyDigits, 10)
      if (!Number.isFinite(num)) num = 0
      if (num < 0) num = 0
      if (num > 100) num = 100

      setDedicatedInput(String(num))
 
      setDedicationData((prev) => ({ ...prev, dedicated: num }))
      return
    }

    setDedicationData((prev) => ({ ...prev, [name]: value }))
  }



  const handleAddDedication = async () => {

    if (dedicatedInput === '' || !Number.isFinite(Number(dedicatedInput))) {
      setAlert(true)
      setError({ success: false, msg: 'Debe ingresar un valor entre 0 y 100' })
      return
    }
    const dedicatedNumber = Math.min(100, Math.max(0, parseInt(dedicatedInput, 10)))

    try {
      const formattedWeek = convertDateFormat(dedicationData.week)

      const updatedDedication = {
        ...dedicationData,
        week: formattedWeek,
        dedicated: dedicatedNumber / 100, 
        user_id: userId,
      }

      const response = await insertDedication(updatedDedication, token)

      if (response.success) {
        setAlert(true)
        setError({
          success: true,
          msg: 'Dedicación registrada correctamente',
        })

        
        setDedicatedInput('')
        setDedicationData((prev) => ({
          ...prev,
          project_id: '',
          week: '',
          dedicated: 0,
          consolidation: 0,
        }))
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
            user_id: userId,
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
      await deleteDedicationByIdQuery(dedicationId, token)
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
        const data = await getProjectsAndActivities(token)
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
      const data = await getDedicationsNotConsolidated(token, userId)

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
      const data = await getHistoryDedicationsByUserId(token, userId)
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
    setWeeks(getWeeksAround()); // semana actual ±2
  }, []); // se calcula una sola vez

  
  
  useEffect(() => {
    fetchHistoryDedications()
  }, [])

  const handleCloseAlert = () => {
    setAlert(false)
  }

  const handleFinish = async () => {
    const dedicationData = dedicationsNotConsolidated.map((dedication) => ({
      ...dedication,
      consolidation: 1,
      dedicated: dedication.dedicated / 100,
    }))

    try {
      const response = await updateConsolidationsQuery(dedicationData, token)

      console.log(response)
      if (response.success) {
        await fetchDataDedications()

        setEditingDedication(null)
        setAlert(true)
        setError({
          success: true,
          msg: response.msg || 'Dedicaciones consolidadas',
        })

        setDedicationData({
          user_id: userId,
          project_id: '',
          week: '',
          dedicated: 0,
          consolidation: 0,
        })
      } else {
        setAlert(true)
        setError({
          success: false,
          msg: response.msg || 'Error al consolidar las dedicaciones',
        })
      }
    } catch (error) {
      console.log(error)
      setAlert(true)
      setError({
        success: false,
        msg: 'Error al ingresar las dedicaciones',
      })
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
                className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm   placeholder:text-gray-400 focus:border-gray-40  sm:text-sm sm:leading-6"
                placeholder={localStorage.getItem('name')!}
                disabled
              />
            </div>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Seleccione el Proyecto
            </label>
            <select
              value={dedicationData.project_id}
              onChange={handleChange}
              name="project_id"
              className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm   placeholder:text-gray-400 focus:border-gray-40  sm:text-sm sm:leading-6"
            >
              <option value="">
                Seleccione un proyecto
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.client_name} - {project.project_name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Seleccione la Semana
            </label>
            <div className="mt-2">
              <select
                name="week"
                className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm   placeholder:text-gray-400 focus:border-gray-40  sm:text-sm sm:leading-6"
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
              Porcentaje de Dedicación (%)
            </label>
            <div className="mt-2">
              <input
                type="number"
                name="dedicated"
                value={dedicatedInput} 
                onChange={handleChange}
                onKeyDown={(e) => {
               
                  if (['.', ',', 'e', 'E', '-', '+'].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                inputMode="numeric"
                step={1}
                min={0}
                max={100}
                pattern="\d*"
                className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm  placeholder:text-gray-400  focus:border-gray-400 sm:text-sm sm:leading-6"
                placeholder="Ej: 50"
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
              />

                {(() => {
                  const validProject = dedicationData.project_id !== ''
                  const validWeek = dedicationData.week !== ''
                  const validDedicated = dedicatedInput !== '' && Number.isFinite(Number(dedicatedInput)) && Number(dedicatedInput) >= 0 && Number(dedicatedInput) <= 100
                  const canSubmit = validProject && validWeek && validDedicated

                  return (
                    <ButtonsSubmits
                      disabledAdd={canSubmit} 
                      onAdd={handleAddDedication}
                      onFinish={handleFinish}
                      data={dedicationsNotConsolidated}
                    />
                  )
                })()}

            </>
          ) : (
            <TableHistoryDedications historyDedications={historyDedications} />
          )}
        </div>
      )}
    </>
  )
}
