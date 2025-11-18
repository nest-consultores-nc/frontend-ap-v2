import { useEffect, useState, useMemo } from 'react'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import type { Dayjs} from 'dayjs'
import { IProject } from '../../interfaces/projects/projects.interface'
import { getAllProjects } from '../../api/projects/get-projects'
import { useNavigate } from 'react-router-dom'
import { HeaderPages } from '../../components'
import { TableUploadIncomes } from '../../components/TableUploadIncomes/TableUploadIncomes'
import { IIncome } from '../../interfaces/income/income.interface'
import { createIncomeQuery } from '../../api/income/post-income'
import { SubmitButtonsCsv } from '../../components/SubmitButtonsCsv/SubmitButtonsCsv'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'
import { IOutlayTemporality } from '../../interfaces/outlay/outlay.interface'
import { getAllOutlayData } from '../../api/outlay/get-outlay'
import { isFormValid } from '../../functions/isFormValid'
import { TabsViewMode} from '../../components/TabsViewMode/TabsViewMode'

const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function makeMonthList(start: Dayjs = dayjs(), count = 15) {
  const anchor = start.startOf('month')
  return Array.from({ length: count }, (_, i) => {
    const d = anchor.add(i, 'month')
    const abbr = MONTHS_ES[d.month()] 
    const yy = d.format('YY')        
    return { name: `${abbr}-${yy}` }
  })
}
 
  const cmp = (a: string, b: string) =>
    a.localeCompare(b, 'es', { sensitivity: 'base', ignorePunctuation: true });

  const getProjectLabel = (p: IProject) =>
    (p.client?.clientName ? `${p.client.clientName} - ` : '') + p.project_name;
  
export default function IncomesPage() {
  const [loading, setLoading] = useState<boolean>(true)
  const [projectsAndActivities, setProjectsAndActivities] = useState<
    IProject[]
  >([])

  const sortedProjectsAndActivities = useMemo(
  () => [...projectsAndActivities].sort((a, b) => cmp(getProjectLabel(a), getProjectLabel(b))),
  [projectsAndActivities]
  )

  const [viewMode, setViewMode] = useState<'form' | 'upload'>('form')
  const [csvMonth, setCsvMonth] = useState<string>('')
  const [projectsIncome, setProjectsIncome] = useState<IIncome[]>([])
  const [temporalities, setTemporalities] = useState<IOutlayTemporality[]>([])
  const [monthAnchor, setMonthAnchor] = useState(dayjs().startOf('month'))

 
  const TEMPORALITY_MAP: Record<number, string> = {
    1: 'Mensual',
    2: 'Trimestral',
    3: 'Cuatrimestral',
    4: 'Semestral',
    5: 'Anual',
  }

  const [formData, setFormData] = useState<IIncome>({
    project_id: 0,
    temporalities_id: 0,
    detail: '',
    amount: '',
    uf: '',
    date: '',
    month: '',
  })


  const monthFormatted = useMemo(
    () => makeMonthList(monthAnchor, 15),
    [monthAnchor]
  )
  useEffect(() => {
  const nextMonthStart = monthAnchor.add(1, 'month').startOf('month')
  const msUntilNext = nextMonthStart.diff(dayjs())

  const t = setTimeout(() => {
    setMonthAnchor(dayjs().startOf('month'))
  }, Math.max(msUntilNext, 0))

  return () => clearTimeout(t)
}, [monthAnchor])

  useEffect(() => {
    if (!formData.month && monthFormatted.length > 0) {
      setFormData(prev => ({ ...prev, month: monthFormatted[0].name }))
    }
  }, [monthFormatted]) // eslint-disable-line react-hooks/exhaustive-deps


  console.log(projectsAndActivities, loading)
  const navigate = useNavigate()
  const canSave = isFormValid(formData);

  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

  useEffect(() => {
  if (!csvMonth && monthFormatted.length > 0) {
    setCsvMonth(monthFormatted[0].name)
  }
  }, [monthFormatted]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { projects } = await getAllProjects(
          localStorage.getItem('token')!,
          false
        )
        setProjectsAndActivities(projects)

        const outlayData = await getAllOutlayData(
          localStorage.getItem('token')!,
          localStorage.getItem('id')!,
          localStorage.getItem('email')!
        )
        setTemporalities(outlayData.outlayTemporalities)
      } catch (e) {
        console.error('Error fetching projects:', e)
        await Swal.fire({
          title: 'Error',
          text: 'Ha ocurrido un error al traer datos desde la base de datos.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#4f46e5',
        })
      } finally {

        setLoading(false)
      }
    }

    fetchData()
  }, [])

    const handleSubmit = async (incomeData: IIncome[]) => {
    // Antes de nada validamos temporalidades explícitamente:
    const invalidTemporalitiesRows = incomeData
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => {
        // Convertimos a número por si viene string
        const t = Number(r.temporalities_id)
        return !(t >= 1 && t <= 5) // válido sólo 1..5
      })

    if (invalidTemporalitiesRows.length > 0) {
      // Si hay una sola fila damos detalle simple, si hay varias listamos índices (1-based)
      if (incomeData.length === 1) {
        await Swal.fire({
          title: 'Temporalidad inválida',
          html: `
            <div style="text-align:left">
              La temporalidad debe ser uno de: <b>1,2,3,4,5</b>.<br/>
              <ul style="margin-top:8px; padding-left:18px;">
                ${Object.entries(TEMPORALITY_MAP).map(([k, v]) => `<li><b>${k}</b> - ${v}</li>`).join('')}
              </ul>
            </div>
          `,
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#4f46e5',
        })
      } else {
        const rows = invalidTemporalitiesRows.map(({ idx }) => idx + 1).join(', ')
        await Swal.fire({
          title: 'Filas con temporalidad inválida',
          html: `
            <div style="text-align:left">
              Las filas <b>${rows}</b> tienen una temporalidad inválida. Use sólo 1,2,3,4 o 5.<br/>
              <small>1: Mensual, 2: Trimestral, 3: Cuatrimestral, 4: Semestral, 5: Anual</small>
            </div>
          `,
          icon: 'warning',
          confirmButtonText: 'Corregir CSV',
          confirmButtonColor: '#4f46e5',
        })
      }
      return // bloqueamos envío hasta que corrijan
    }

    // Validación de campos requeridos (tu lógica original para single-row)
    if (incomeData.length === 1) {
      const d = incomeData[0]
      const missing: string[] = []
      if (!d.project_id) missing.push('Proyecto')
      if (!d.temporalities_id) missing.push('Temporalidad')
      if (!String(d.amount).trim()) missing.push('Ingresos')
      if (!d.date) missing.push('Fecha')
      if (!d.month) missing.push('Mes')

      if (missing.length > 0) {
        await Swal.fire({
          title: 'Faltan datos obligatorios',
          html: `
            <div style="text-align:left">
              Debes completar:
              <ul style="margin-top:8px; padding-left:18px;">
                ${missing.map(m => `<li>${m}</li>`).join('')}
              </ul>
            </div>
          `,
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#4f46e5',
        })
        return
      }

      const proj = projectsAndActivities.find(p => p.id === Number(d.project_id))
      const projName = proj
        ? `${proj.client.clientName} - ${proj.project_name}`
        : d.detail || '(sin proyecto)'

      const temporalityName =
        TEMPORALITY_MAP[Number(d.temporalities_id)] ||
        temporalities.find(t => t.id === Number(d.temporalities_id))?.name ||
        '(sin temporalidad)'

      const { isConfirmed } = await Swal.fire({
        title: '¿Registrar este ingreso?',
        html: `
          <div style="text-align:left">
            <b>Proyecto:</b> ${projName}<br/>
            <b>Temporalidad:</b> ${temporalityName}<br/>
            <b>Detalle:</b> ${d.detail || '(sin detalle)'}<br/>
            <b>Ingresos:</b> ${d.amount || '0'}<br/>
            <b>UF:</b> ${d.uf || '0'}<br/>
            <b>Fecha:</b> ${dayjs(d.date).format('YYYY-MM-DD')}<br/>
            <b>Mes:</b> ${d.month}
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'No, volver',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      })
      if (!isConfirmed) return
    } else {
      const { isConfirmed } = await Swal.fire({
        title: '¿Registrar ingresos desde archivo?',
        html: `
          <div style="text-align:left">
            Se registrarán <b>${incomeData.length}</b> filas.
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'No, volver',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      })
      if (!isConfirmed) return
    }

    try {
      const response = await createIncomeQuery(
        incomeData,
        localStorage.getItem('token')!
      )

      // Manejo robusto de respuesta: soporta { success: true }, { status:200 }, o { inserted: n }
      const respAny = response as any
      const msgLower = (respAny?.msg || respAny?.message || '').toLowerCase()
      const ok =
        (respAny?.success === true ||
        respAny?.status === 200 ||
        respAny?.statusCode === 200 ||
        Number(respAny?.inserted) > 0) &&
        !msgLower.includes('error')


      if (ok) {
        // Si backend trae un mensaje claro, mostrarlo; si no, mensaje estandar
        const successMsg = respAny?.msg || respAny?.message || 'Los ingresos fueron registrados correctamente.'
        await Swal.fire({
          title: '¡Registro exitoso!',
          text: successMsg,
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6',
        })

        if (incomeData.length === 1) {
          setFormData({
            project_id: 0,
            temporalities_id: 0,
            detail: '',
            amount: '',
            uf: '',
            date: '',
            month: '',
          })
        } else {
          setProjectsIncome([])
        }
      } else {
        // Mostrar mensaje de error devuelto por el backend (si existe) o genérico
        const errMsg = respAny?.msg || respAny?.message || 'Ha ocurrido un error al registrar los ingresos.'
        await Swal.fire({
          title: 'Error',
          text: errMsg,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        })
      }
    } catch (error) {
      console.error(error)
      await Swal.fire({
        title: 'Error',
        text: 'Ha ocurrido un error inesperado al registrar los ingresos.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      })
    }
  }



  const handleDownloadCSV = () => {
    if (!Array.isArray(projectsAndActivities)) {
      console.error('projectsAndActivities is not an array')
      return
    }

    // Mes seleccionado (ej: "may-26")
    const selectedMonth = csvMonth || `${MONTHS_ES[dayjs().month()]}-${dayjs().format('YY')}`

    // Convertir selectedMonth -> primer día formato DD/MM/YYYY (ej: "01/05/2026")
    const firstDayForCsv = firstDayFromMonthString(selectedMonth, 'DD/MM/YYYY') || dayjs().startOf('month').format('DD/MM/YYYY')

    const csvData = projectsAndActivities.map(
      (project): IIncome => ({
        detail: project.project_name + ' - ' + project.client.clientName,
        amount: '',
        uf: '0.00',
        // acá ponemos 01/05/2026 si selectedMonth === 'may-26'
        date: firstDayForCsv,
        project_id: project.id,
        temporalities_id: 0,
        month: selectedMonth,
      })
    )

    const csv = Papa.unparse(csvData)
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `incomes-${selectedMonth}.csv`)
  }


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (result) => {
          console.log('Raw parsed data:', result.data)

          const currentDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
          const updatedData = result.data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((row: any) => {
              // si el CSV no incluye month, usar el csvMonth seleccionado
              const resolvedMonth = row.month && String(row.month).trim() ? String(row.month).trim() : csvMonth

              // Resolve date:
              // - si row.date está en formato "may-26" -> lo convertimos a ISO 'YYYY-MM-DD' (para backend)
              // - si row.date vacío -> usamos resolvedMonth y lo convertimos a ISO
              let resolvedDate = row.date && String(row.date).trim() ? String(row.date).trim() : ''

              const mmmPattern = /^[a-z]{3}-\d{2}$/i
              if (mmmPattern.test(resolvedDate)) {
                const iso = firstDayFromMonthString(resolvedDate, 'YYYY-MM-DD')
                if (iso) resolvedDate = iso
              } else if (!resolvedDate) {
                // Si no trae date, usar csvMonth como fallback en ISO
                const iso = firstDayFromMonthString(resolvedMonth, 'YYYY-MM-DD')
                if (iso) resolvedDate = iso
              }

              if (
                row.project_id &&
                resolvedDate &&
                row.temporalities_id &&
                row.amount
              ) {
                return {
                  detail: row.detail,
                  amount: row.amount,
                  uf: row.uf,
                  project_id: Number(row.project_id),
                  // enviamos date en ISO (YYYY-MM-DD) para consumir por la API
                  date: resolvedDate,
                  temporalities_id: row.temporalities_id,
                  month: resolvedMonth,
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
            await Swal.fire({
              title: 'Archivo inválido',
              text: 'Revisa el CSV. "project_id", "date", "temporalities_id" y "amount" son obligatorios.',
              icon: 'warning',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#4f46e5',
            })
          }
        },
        error: async (err) => {
          console.error('Error reading CSV file:', err)
          await Swal.fire({
            title: 'Error al leer el archivo',
            text: 'Revisa que el CSV tenga cabeceras y el formato esperado.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#4f46e5',
          })
        },
      })
    } else {
      console.error('Por favor subir un archivo CSV válido.')
    }
  }


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    if (name === 'project_id') {
      const selectedProject = projectsAndActivities.find(
        (project) => project.id === Number(value)
      )

      setFormData((prevData) => ({
        ...prevData,
        project_id: Number(value),
        detail: selectedProject
          ? `${selectedProject.client.clientName} - ${selectedProject.project_name}`
          : '',
      }))
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  }

  const onlyDigitsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
    if (allowed.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, amount: digitsOnly }));
  };

  const onlyDigitsPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (!/^\d*$/.test(text)) {
      e.preventDefault();                
      const digits = text.replace(/\D/g, '');
      if (digits) {
        const target = e.target as HTMLInputElement;
        const { value } = target;
        const start = target.selectionStart ?? value.length;
        const end = target.selectionEnd ?? start;
        const newValue = value.slice(0, start) + digits + value.slice(end);
        setFormData(prev => ({ ...prev, amount: newValue }));
      }
    }
  };

  const parseMonthString = (monthStr: string | undefined | null) => {
    if (!monthStr || typeof monthStr !== 'string') return null
    const parts = monthStr.trim().toLowerCase().split('-')
    if (parts.length !== 2) return null
    const [abbr, yy] = parts
    const monthIndex = MONTHS_ES.findIndex(m => m === abbr)
    if (monthIndex === -1) return null
    // Convertimos '26' => 2026 (asumimos siglo 2000)
    const yearNum = Number(yy)
    if (Number.isNaN(yearNum)) return null
    const year = 2000 + yearNum
    return { year, monthIndex } // monthIndex 0..11
  }

  const firstDayFromMonthString = (
    monthStr: string | undefined | null,
    outputFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' = 'DD/MM/YYYY'
  ) => {
    const parsed = parseMonthString(monthStr)
    if (!parsed) return null
    const { year, monthIndex } = parsed
    const d = dayjs(new Date(year, monthIndex, 1))
    return outputFormat === 'DD/MM/YYYY' ? d.format('DD/MM/YYYY') : d.format('YYYY-MM-DD')
  }


  return (
    <div>

      <HeaderPages
        titlePage="Registrar Ingresos"
        subTitlePage={
          <>
            <span className="hidden lg:inline">
              Por favor, selecciona una opción para continuar.
            </span>
            <span className="inline lg:hidden">
              Por favor, completa cada campo solicitado para continuar.
            </span>
          </>
        }
      />

      <div className="hidden lg:block">
        <TabsViewMode
          active={viewMode}
          onChange={setViewMode}
          labels={{ form: 'Completar Formulario', upload: 'Subir Archivo' }}
        />
      </div>
      {/* --- Selector de mes para el CSV (visible en la vista upload) */}
      {viewMode === 'upload' && (
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-900">Mes para CSV</label>
          <select
            name="csv_month"
            value={csvMonth}
            onChange={(e) => setCsvMonth(e.target.value)}
            className="outline-none mt-0 rounded-md border px-2 py-1 text-gray-900 shadow-sm"
          >
            {monthFormatted.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Se usará este mes para generar el formato de archivo CSV</span>
            <small className="text-xs text-gray-500 mt-1">
              Temporalidades: <b>1</b> Mensual, <b>2</b> Trimestral, <b>3</b> Cuatrimestral, <b>4</b> Semestral, <b>5</b> Anual.
            </small>
          </div>

        </div>
      )}
    {viewMode === 'form' ? (
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit([formData]); }}>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Seleccionar un Proyecto
            </label>
            <select
              name="project_id"
              value={formData.project_id}
              onChange={handleInputChange}
              className="outline-none mt-2 block w-full rounded-md border px-1 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400"
            >
              <option value="">Seleccione un proyecto</option>
                {sortedProjectsAndActivities.map((project) => (
                  <option key={project.id} value={project.id}>
                    {getProjectLabel(project)}
                  </option>
                ))}

            </select>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Seleccionar la Temporalidad
            </label>
            <select
              name="temporalities_id"
              value={formData.temporalities_id}
              onChange={handleInputChange}
              className="outline-none mt-2 block w-full rounded-md border px-1 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400"
            >
              <option value="">Seleccione una temporalidad</option>
              {temporalities.map((temporality) => (
                <option key={temporality.id} value={temporality.id}>
                  {temporality.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Ingrese el Detalle
            </label>
            <input
              type="text"
              name="detail"
              value={formData.detail}
              onChange={handleInputChange}
              className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400"
              placeholder="Ingrese el detalle"
            />
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Ingrese el Monto
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              autoComplete="off"
              name="amount"
              value={formData.amount}
              onChange={handleAmountChange}
              onKeyDown={onlyDigitsKeyDown}
              onPaste={onlyDigitsPaste}
              className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400"
              placeholder="Ej: 300000 (solo números)"
            />

          </div>
          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Ingrese la Fecha
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400"
            />
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Seleccione el Mes
            </label>
            <select
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              className="outline-none mt-2 block w-full rounded-md border px-1 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400"
            >
              <option value="">Seleccione un mes</option>
              {monthFormatted.map((month) => (
                <option key={month.name} value={month.name}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm
              ${canSave
                ? 'bg-[#3E3378] hover:bg-[#89CCDC] hover:text-black'
                : 'bg-gray-400 cursor-not-allowed'}`}
            disabled={!canSave}
          >
            Guardar
          </button>
        </div>
      </form>
      ) : (
          <form className="hidden lg:block">
            <label className="block text-sm font-medium text-gray-900">
              Subir Archivo
            </label>
            <div className="flex justify-between">
              <input
                id="file_input"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="block w-full text-sm p-2 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              />
            </div>
            <div className="overflow-x-auto mt-4">
              <TableUploadIncomes projectsIncome={projectsIncome} />
            </div>
            <SubmitButtonsCsv
              handleDownloadCSV={handleDownloadCSV}
              handleSubmit={() => handleSubmit(projectsIncome)}
              hasData={projectsIncome.length > 0}
            />
          </form>
        )}

    </div>
  )
}
