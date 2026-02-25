import { useEffect, useState } from 'react'
import { createClientQuery } from '../../api/clients'
import Swal from 'sweetalert2' 
import { useNavigate } from 'react-router-dom'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'
import { HeaderPages } from '../../components/index'
interface ClientData {
  client_name: string
  client_description: string
}

export default function CreateClient() {

  const [data, setData] = useState<ClientData>({
    client_name: '',
    client_description: '',
  })

  const navigate = useNavigate()
  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    })
  }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

  
    if (!data.client_name.trim()) {
      await Swal.fire({
        title: 'Falta ingresar datos',
        text: 'Por favor, ingresa el nombre del cliente.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#CDEA80',
      })
      return
    }

    const { isConfirmed } = await Swal.fire({
      title: '¿Deseas guardar este cliente?',
      html: `
        <div style="text-align:left">
          <b>Nombre:</b> ${data.client_name || '(sin nombre)'}<br/>
          <b>Descripción:</b> ${data.client_description || '(sin descripción)'}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'No, volver',
      confirmButtonColor: '#CDEA80',
      cancelButtonColor: '#FF735C',
    })
    if (!isConfirmed) return

    try {
      const token = localStorage.getItem('token')!
      const response = await createClientQuery(data, token)

      if (response?.success) {
        await Swal.fire({
          title: '¡Registro exitoso!',
          text: response.msg || 'El cliente fue registrado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#CDEA80',
        })

        setData({ client_name: '', client_description: '' })
         
      } else {
        await Swal.fire({
          title: 'Error',
          text: response?.msg || 'Ha ocurrido un error al intentar registrar al cliente',
          icon: 'error',
        })
      }
    } catch (error) {
      console.log(error)
      await Swal.fire({
        title: 'Error',
        text: 'Ha ocurrido un error al intentar registrar al cliente',
        icon: 'error',
      })
    }
  }



  return (
    <form onSubmit={handleSubmit}>

      <HeaderPages
        titlePage="Registrar Nuevo Cliente"
        subTitlePage="Por favor, ingresa los datos en los campos correspondientes."
      />

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Nombre del Cliente
          </label>
          <div className="mt-2">
            <div className="flex shadow-sm">
              <input
                type="text"
                name="client_name"
                className="outline-none flex-1 rounded border bg-transparent p-1 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:border-gray-400"
                placeholder="Cliente Pólux"
                value={data.client_name}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Descripción
          </label>
          <div className="mt-2">
            <textarea
              className="block outline-none w-full rounded-md border p-1 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:border-gray-400"
              placeholder="Describe general y brevemente al cliente"
              name="client_description"
              value={data.client_description}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end">
        <button
          type="submit"
          disabled={!data.client_name.trim()}
          className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm
            ${data.client_name.trim()
              ? 'bg-[#CDEA80] text-[#303031] hover:bg-[#BDDEFF] hover:text-black'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
        >
          Guardar
        </button>
      </div>

    </form>
  )
}
