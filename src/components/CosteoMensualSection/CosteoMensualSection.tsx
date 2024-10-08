import { useState } from 'react'
import { getGenerarCosteoMensual } from '../../api/costeo/get-costeo'
import { ICosteoMensual } from '../../interfaces/costeo/costeo-mensual.interface'
import { TableResultCosteoMensual } from '../TableResultCosteoMensual/TableResultCosteoMensual'
import { downloadCosteoCSV } from '../../functions/downloadCosteoCSV'
import { LoadingCosteo } from '../LoadingCosteo/LoadingCosteo'
import { PickerIcon } from '../../assets/PickerIcon'

export function CosteoMensualSection() {
  const [selectedDate, setSelectedDate] = useState('')
  const [costeoMensual, setCosteoMensual] = useState<ICosteoMensual[]>([])
  const [loading, setLoading] = useState(false)

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await getGenerarCosteoMensual(selectedDate)
      console.log(response)
      setCosteoMensual(response)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleClickDownload = () => {
    downloadCosteoCSV({
      costeoMensual,
      selectedDate,
      nameFile: 'Costeo_Mensual',
    })
  }

  return (
    <section className="bg-white rounded-lg  ">
      <div className="mx-auto max-w-2xl text-center mb-8">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">
          Costeo Mensual
        </h2>
        <p className="mt-4 text-lg leading-6 text-gray-600">
          Para actualizar el costeo mensual, selecciona el mes y año deseados.
        </p>
      </div>

      <div className="max-w-sm mx-auto flex flex-col">
        <label
          htmlFor="datePicker"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Selecciona el mes y año
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <PickerIcon />
          </div>
          <input
            type="month"
            id="datePicker"
            name="datePicker"
            value={selectedDate}
            onChange={handleDateChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Selecciona fecha"
          />
        </div>
        <button
          type="button"
          disabled={!selectedDate || loading}
          onClick={handleSubmit}
          className={`mt-2 rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
            ${
              selectedDate && !loading
                ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
        >
          Actualizar
        </button>
      </div>

      {loading && (
        <LoadingCosteo
          title="Actualizando costeo mensual..."
          subtitle="Espera un momento. por favor."
        />
      )}

      {!loading && costeoMensual.length > 0 && (
        <>
          <div className="w-[100%] text-end mb-8">
            <button
              onClick={handleClickDownload}
              className="bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 mt-2 rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Descargar como CSV
            </button>
            <TableResultCosteoMensual data={costeoMensual} />
          </div>
          <div className="text-center mt-4"></div>
        </>
      )}
    </section>
  )
}
