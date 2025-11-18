import { useState } from 'react'
import Swal from 'sweetalert2'
interface Props {
  handleDownloadCSV: () => void
  handleSubmit: () => void
  hasData: boolean
}

export function SubmitButtonsCsv({
  handleDownloadCSV,
  handleSubmit,
  hasData,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)


  const handleSaveClick = async () => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Registrar ingresos?',
      text: 'Se guardarán los datos cargados en el sistema.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    })

    if (!isConfirmed) return

    setIsSubmitting(true)
    try {
      await handleSubmit()
      await Swal.fire({
        title: '¡Registro exitoso!',
        text: 'Los ingresos fueron registrados correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6',
      })
    } catch (error) {
      console.error(error)
      await Swal.fire({
        title: 'Error',
        text: 'Ha ocurrido un error al registrar los ingresos.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#d33',
      })
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="mt-6 flex items-center justify-end gap-x-6">
      <button
        type="button"
        onClick={handleDownloadCSV}
        className="rounded-md bg-[#3E3378] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#89CCDC] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Descargar Formato
      </button>
      <button
        type="button"
        onClick={handleSaveClick}
        disabled={!hasData || isSubmitting}
        className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          !hasData || isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#3E3378] hover:bg-[#89CCDC] hover:text-black focus-visible:outline-indigo-600'
        }`}
      >
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  )
}
