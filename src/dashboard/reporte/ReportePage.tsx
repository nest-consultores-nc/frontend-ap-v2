import { DocumentArrowDownIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { useState, useMemo } from 'react'

export default function ReportePage() {
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const btnBase =
    'inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg ' +
    'transition-all duration-200 focus:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-[#CDEA80] disabled:opacity-40 disabled:cursor-not-allowed'

  const btnPrimary =
    'text-[#303031] bg-gradient-to-r from-[#CDEA80] to-[#BDDEFF] shadow-lg shadow-[#BDDEFF] ' +
    'hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:shadow-lg'

  const btnSecondary =
    'text-gray-700 white border-2 border-gray-300' +
    'hover:border-gray-400 hover:bg-gray-50'

  const allMonths = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ]

  const { minDate, maxDate } = useMemo(() => {
    const min = { year: 2022, month: 3 } 
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    let maxYear = currentYear
    let maxMonth = currentMonth - 1 
    
    if (maxMonth <= 0) {
      maxMonth += 12
      maxYear -= 1
    }
    
    const max = { year: maxYear, month: maxMonth }
    
    return { minDate: min, maxDate: max }
  }, [])


  const availableYears = useMemo(() => {
    const years = []
    for (let year = maxDate.year; year >= minDate.year; year--) {
      years.push(year)
    }
    return years
  }, [minDate.year, maxDate.year])

  const availableMonths = useMemo(() => {
    if (!selectedYear) return []
    
    const year = parseInt(selectedYear)
    
    return allMonths.filter(month => {
      const monthNum = parseInt(month.value)
      
      if (year === minDate.year) {
        return monthNum >= minDate.month
      }
      
      if (year === maxDate.year) {
        return monthNum <= maxDate.month
      }
      
      return true
    })
  }, [selectedYear, minDate, maxDate, allMonths])

  const isValidSelection = useMemo(() => {
    if (!selectedMonth || !selectedYear) return false
    
    const year = parseInt(selectedYear)
    const month = parseInt(selectedMonth)
    
    if (year < minDate.year || year > maxDate.year) return false
    if (year === minDate.year && month < minDate.month) return false
    if (year === maxDate.year && month > maxDate.month) return false
    
    return true
  }, [selectedMonth, selectedYear, minDate, maxDate])

  const handleGenerateReport = async () => {
    if (!isValidSelection) {
      alert('Por favor selecciona un período válido')
      return
    }
    
    setIsGenerating(true)
    
    try {
      const response = await fetch(
        `https://reporte-ejecutivo-polux-app.azurewebsites.net/api/generar_reporte?mes=${parseInt(selectedMonth)}&anio=${selectedYear}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        throw new Error('Error al generar el reporte')
      }

      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Resumen_Ejecutivo_${selectedYear}${selectedMonth}.pdf`
      document.body.appendChild(link)
      link.click()
      
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log(`Reporte PDF generado: ${selectedMonth}/${selectedYear}`)
      
    } catch (error) {
      console.error('Error generando reporte:', error)
      alert('Ocurrió un error al generar el reporte. Por favor intenta de nuevo.')
    } finally {
      setIsGenerating(false)
    }
  }

 
  const handleYearChange = (newYear: string) => {
    setSelectedYear(newYear)
    
    if (selectedMonth && newYear) {
      const year = parseInt(newYear)
      const month = parseInt(selectedMonth)
      
      if (year === minDate.year && month < minDate.month) {
        setSelectedMonth('')
      }
      if (year === maxDate.year && month > maxDate.month) {
        setSelectedMonth('')
      }
    }
  }

  const canGenerate = isValidSelection

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDEBE5] to-indigo-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
   
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#CDEA80] to-[#BDDEFF] mb-4 shadow-lg">
            <DocumentArrowDownIcon className="h-8 w-8 text-[#303031]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Generación de Reportes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crea reportes ejecutivos en formato PDF con toda la información financiera del período seleccionado
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-gray-900/10 border border-gray-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuración del Reporte</h2>
            <p className="text-gray-600">
              Selecciona el período del cual deseas generar el informe ejecutivo
            </p>
          </div>

          <div className="mb-6 p-4 bg-[#EDEBE5] border border-gray-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#303031] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="text-[#303031] font-semibold mb-1">Períodos disponibles</p>
                <p className="text-gray-700">
                  Desde <span className="font-bold">Marzo 2022</span> hasta <span className="font-bold">
                    {allMonths[maxDate.month - 1]?.label} {maxDate.year}
                  </span>
                </p>

              </div>
            </div>
          </div>

          <div className="space-y-6">
   
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label 
                  htmlFor="year" 
                  className="block text-sm font-semibold text-gray-900 uppercase tracking-wide"
                >
                  Año
                </label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 font-medium
                           focus:ring-4 focus:ring-[#EDEBE5] focus:white
                           transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="">Seleccionar año</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label 
                  htmlFor="month" 
                  className="block text-sm font-semibold text-gray-900 uppercase tracking-wide"
                >
                  Mes
                </label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  disabled={!selectedYear}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 font-medium
                           focus:border-[#EDEBE5] focus:ring-4 focus:ring-[#EDEBE5] focus:white
                           transition-all outline-none appearance-none cursor-pointer
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedYear ? 'Seleccionar mes' : 'Primero selecciona un año'}
                  </option>
                  {availableMonths.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {canGenerate && !isGenerating && (
              <div className="rounded-2xl bg-gradient-to-r from-[#CDEA80] to-[#BDDEFF] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl white/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#303031]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#303031]/80 text-sm font-medium mb-1">PERÍODO SELECCIONADO</p>
                    <p className="text-[#303031] text-xl font-bold">
                      {allMonths.find(m => m.value === selectedMonth)?.label} {selectedYear}
                    </p>
                  </div>
                </div>
              </div>
            )}


            {isGenerating && (
              <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl white/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#303031] animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#303031]/90 text-sm font-medium mb-1">GENERANDO REPORTE</p>
                    <p className="text-[#303031] text-base font-semibold">
                      Por favor espera, esto puede tomar 30-60 segundos...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleGenerateReport}
                disabled={!canGenerate || isGenerating}
                className={`flex-1 ${btnBase} ${btnPrimary}`}
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                {isGenerating ? 'Generando Reporte...' : 'Generar Reporte Ejecutivo'}
              </button>

              <button
                onClick={() => {
                  setSelectedMonth('')
                  setSelectedYear('')
                }}
                disabled={!canGenerate}
                className={`${btnBase} ${btnSecondary}`}
              >
                <FunnelIcon className="h-5 w-5" />
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="white rounded-2xl bg-white p-6 border border-white shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-[#EEEBE6] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#303031]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold mb-1">Formato PDF</h3>
            <p className="text-gray-600 text-sm">Documentos profesionales listos para compartir</p>
          </div>

          <div className="white rounded-2xl bg-white p-6 border border-white shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-[#EEEBE6] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#303031]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold mb-1">Generación Automática</h3>
            <p className="text-gray-600 text-sm">Claridad total en segundos: Reportes automatizados para guiar el rumbo de tu negocio.</p>
          </div>

          <div className="white rounded-2xl bg-white p-6 border border-white shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-[#EEEBE6] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#303031]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold mb-1">Datos Completos</h3>
            <p className="text-gray-600 text-sm">Toda la información financiera del período</p>
          </div>
        </div>
      </div>
    </div>
  )
}