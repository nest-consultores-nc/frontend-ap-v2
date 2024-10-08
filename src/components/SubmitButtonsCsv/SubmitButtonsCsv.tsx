import { useState } from 'react'

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
    setIsSubmitting(true)
    try {
      await handleSubmit()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
        Descargar Formato
      </button>
      <button
        type="button"
        onClick={handleSaveClick}
        disabled={!hasData || isSubmitting}
        className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          !hasData || isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600'
        }`}
      >
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  )
}
