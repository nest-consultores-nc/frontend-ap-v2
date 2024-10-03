import { useState } from 'react'
import { Datum } from '../../interfaces/costeo/utilidad.interface'
import { getGenerarUtilidad } from '../../api/costeo/get-costeo'
import { downloadCosteoCSV } from '../../functions/downloadCosteoCSV'
import { TableResultUtilidad } from '../TableResultUtilidad/TableResultUtilidad'
import { LoadingCosteo } from '../LoadingCosteo/LoadingCosteo'

export function UtilidadSection() {
  const [loading, setLoading] = useState(false)
  const [utilidad, setUtilidad] = useState<Datum[]>([])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await getGenerarUtilidad()
      setUtilidad(response.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleClickDownload = () => {
    const today = new Date()
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${today.getFullYear()}`

    downloadCosteoCSV({
      datumData: utilidad,
      nameFile: 'utilidad',
      selectedDate: formattedDate,
    })
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Utilidad
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          En esta sección puedes generar las utilidad de los distintos proyectos
          mes a mes.
        </p>
        <div className="max-w-sm mx-auto flex flex-col">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className={`mt-2 rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
            ${
              !loading
                ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            Generar
          </button>
        </div>
      </div>
      {loading && (
        <LoadingCosteo
          title="Generando utilidad..."
          subtitle="Este proceso puede tardar unos momentos. Por favor, espere."
        />
      )}

      {!loading && utilidad.length > 0 && (
        <>
          <div className="w-[100%] text-end mb-8">
            <button
              onClick={handleClickDownload}
              className="bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 mt-2 rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Descargar como CSV
            </button>
            <TableResultUtilidad data={utilidad} />
          </div>
          <div className="text-center mt-4"></div>
        </>
      )}
    </section>
  )
}
