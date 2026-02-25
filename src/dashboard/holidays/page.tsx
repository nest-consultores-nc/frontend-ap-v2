import { useEffect, useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { Alerts, HeaderPages } from '../../components'
import { isFormValid } from '../../functions/isFormValid'
import { createHolidayQuery } from '../../api/holidays/post-holidays'

export interface IIHolidayForm {
  date: string
  day: string
  event: string
  type?: string
}

interface ErrorState {
  success: boolean
  msg: string
}

export default function Holidays() {
  const navigate = useNavigate()
  const [alert, setAlert] = useState(false)
  const [holidaysData, setHolidaysData] = useState<IIHolidayForm>({
    date: '',
    day: '',
    event: '',
    type: 'Día Libre',
  })
  const [error, setError] = useState<ErrorState>({
    success: false,
    msg: '',
  })
  const [submitting, setSubmitting] = useState(false)


  const handleChange = useCallback(
    (field: keyof IIHolidayForm, value: string) => {
      if (field === 'date') {
        const dayName = dayjs(value).locale('es').format('dddd')
        setHolidaysData((prev) => ({ ...prev, date: value, day: dayName }))
      } else {
        setHolidaysData((prev) => ({ ...prev, [field]: value }))
      }
    },
    []
  )

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const confirm = await Swal.fire({
      title: '¿Registrar día libre?',
      text: 'Se guardará el día libre para la fecha seleccionada.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#CDEA80',
      cancelButtonColor: '#FF735C',
       
    })

    if (!confirm.isConfirmed) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')!
      const email = localStorage.getItem('email')!
      const { msg, success } = await createHolidayQuery(
        {
          ...holidaysData,
          type: `Día libre otorgado por ${email} `,
        },
        token
      )

      setError({ success, msg })
      setAlert(true)

      setHolidaysData({ date: '', day: '', event: '', type: '' })

      await Swal.fire({
        title: success ? '¡Guardado!' : 'Atención',
        text: msg,
        icon: success ? 'success' : 'warning',
        confirmButtonColor: '#CDEA80',
        confirmButtonText: 'Aceptar',
      })
    } catch (error) {
      console.log(error)
      setAlert(true)
      setError({
        success: false,
        msg: 'Ha ocurrido un error al intentar registrar el feriado',
      })
      await Swal.fire({
        title: 'Error',
        text: 'Ha ocurrido un error al intentar registrar el feriado',
        icon: 'error',
        confirmButtonColor: '#FF735C',
        confirmButtonText: 'Cerrar',
      })
    } finally {
      setSubmitting(false)
    }
  }


  useEffect(() => {
    if (!localStorage.getItem('token')) {
      localStorage.clear()
      navigate('/iniciar-sesion')
    }
  }, [navigate])

  const handleCloseAlert = () => setAlert(false)

  return (
    <form onSubmit={submitForm}>
      {alert && (
        <Alerts
          message={
            error.success ? 'Registro Exitoso:' : 'Ha ocurrido un error:'
          }
          success={error.success}
          subtitle={error.msg}
          close={handleCloseAlert}
        />
      )}

      <HeaderPages
        titlePage="Registrar días Libres"
        subTitlePage="En caso de dar días libres, debes registrarlo en este formulario. No debes ingresar los feriados legales"
      />

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Ingrese la Fecha
          </label>
          <input
            type="date"
            name="date"
            value={holidaysData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 sm:text-sm sm:leading-6"
            required
          />
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Ingrese el Detalle
          </label>
          <input
            type="text"
            name="event"
            value={holidaysData.event}
            onChange={(e) => handleChange('event', e.target.value)}
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 sm:text-sm sm:leading-6"
            placeholder="Detalle del día libre"
            required
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">

        <button
          type="submit"
          disabled={!isFormValid(holidaysData) || submitting}
          className={`rounded-md px-3 py-2 text-sm font-semibold text-[#303031] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
            isFormValid(holidaysData) && !submitting
              ? 'bg-[#CDEA80] text-[#303031] hover:bg-[#BDDEFF] hover:text-black focus-visible:outline-indigo-600'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Guardar
        </button>

      </div>
    </form>
  )
}