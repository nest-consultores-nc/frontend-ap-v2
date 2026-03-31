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
  const [, setLoading] = useState<boolean>(true)
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
  const [fileSelected, setFileSelected] = useState<boolean>(false) 
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
      const firstMonth = monthFormatted[0].name
      const isoDate = firstDayFromMonthString(firstMonth, 'YYYY-MM-DD')
      setFormData(prev => ({ 
        ...prev, 
        month: firstMonth,
        date: isoDate || ''
      }))
    }
  }, [monthFormatted]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (formData.month) {
      const isoDate = firstDayFromMonthString(formData.month, 'YYYY-MM-DD')
      if (isoDate && formData.date !== isoDate) {
        setFormData(prev => ({ ...prev, date: isoDate }))
      }
    }
  }, [formData.month]) // eslint-disable-line react-hooks/exhaustive-deps


   
  const navigate = useNavigate()
  const canSave = useMemo(() => {
    return (
      formData.project_id > 0 &&
      formData.temporalities_id > 0 &&
      formData.detail.trim() !== '' &&
      formData.amount.trim() !== '' &&
      formData.date.trim() !== '' &&
      formData.month.trim() !== ''
    )
  }, [formData])

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
          confirmButtonColor: '#CDEA80',
        })
      } finally {

        setLoading(false)
      }
    }

    fetchData()
  }, [])

    const handleSubmit = async (incomeData: IIncome[]) => {

    const invalidTemporalitiesRows = incomeData
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => {
  
        const t = Number(r.temporalities_id)
        return !(t >= 1 && t <= 5) 
      })

    if (invalidTemporalitiesRows.length > 0) {

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
          confirmButtonColor: '#CDEA80',
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
          confirmButtonColor: '#CDEA80',
        })
      }
      return 
    }

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
          confirmButtonColor: '#CDEA80',
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
            <b>Fecha:</b> ${dayjs(d.date).format('YYYY-MM-DD')}<br/>
            <b>Mes:</b> ${d.month}
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
        confirmButtonColor: '#CDEA80',
        cancelButtonColor: '#FF735C',
      })
      if (!isConfirmed) return
    }

  
    try {
      const transformedData = incomeData.map(income => ({
        projectId: Number(income.project_id),           
        temporalityId: Number(income.temporalities_id), 
        detail: income.detail,
        amount: Number(income.amount),                  
        date: income.date,
        month: income.month,
      }))

      const response = await createIncomeQuery(
        transformedData as any,  
        localStorage.getItem('token')!
      )

        const respAny = response as any
        
        if (respAny?.success === true || respAny?.status === 200) {
          const successMsg = respAny?.msg || respAny?.message || 'Los ingresos fueron registrados correctamente.'
          
          await Swal.fire({
            title: '¡Registro exitoso!',
            text: successMsg,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#CDEA80',
          })

          if (incomeData.length === 1) {
            setFormData({
              project_id: 0,
              temporalities_id: 0,
              detail: '',
              amount: '',
              date: '',
              month: '',
            })
          } else {
            setProjectsIncome([])
            const fileInput = document.getElementById('file_input') as HTMLInputElement
            if (fileInput) fileInput.value = ''
            setFileSelected(false)
          }
        } else {
   
          throw new Error(respAny?.msg || respAny?.error || 'Error desconocido')
        }

      } catch (error: any) {
        console.error('Error al registrar:', error)
        
        const errorMsg = error?.response?.data?.error || 
                        error?.response?.data?.msg || 
                        error?.message || 
                        'Ha ocurrido un error inesperado al registrar los ingresos.'
        
        await Swal.fire({
          title: 'Error',
          text: errorMsg,
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#CDEA80',
        })
      }
  }

  const handleDownloadCSV = () => {
    if (!Array.isArray(projectsAndActivities)) {
      console.error('projectsAndActivities is not an array')
      return
    }


    const selectedMonth = csvMonth || `${MONTHS_ES[dayjs().month()]}-${dayjs().format('YY')}`

    const firstDayForCsv = firstDayFromMonthString(selectedMonth, 'DD/MM/YYYY') || dayjs().startOf('month').format('DD/MM/YYYY')

    const csvData = projectsAndActivities.map(
      (project): IIncome => ({
        detail: project.project_name + ' - ' + project.client.clientName,
        amount: '',
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
    setFileSelected(!!file)
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (result) => {

          const requiredColumns = ['project_id', 'temporalities_id', 'amount', 'date', 'month', 'detail']
          const csvColumns = result.meta.fields || []
          const missingColumns = requiredColumns.filter(col => !csvColumns.includes(col))

          if (missingColumns.length > 0) {
            await Swal.fire({
              title: 'CSV inválido',
              html: `
                <div style="text-align:left">
                  Faltan columnas obligatorias en el archivo:<br/>
                  <ul style="margin-top:8px; padding-left:18px;">
                    ${missingColumns.map(col => `<li><b>${col}</b></li>`).join('')}
                  </ul>
                  <small style="display:block; margin-top:12px;">
                    El CSV debe tener exactamente estas columnas:<br/>
                    <b>detail, amount, date, project_id, temporalities_id, month</b>
                  </small>
                </div>
              `,
              icon: 'error',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#CDEA80',
            })
            return
          }


          const allowedColumns = ['detail', 'amount', 'date', 'project_id', 'temporalities_id', 'month']
          const extraColumns = csvColumns.filter(col => !allowedColumns.includes(col))

          if (extraColumns.length > 0) {
            await Swal.fire({
              title: 'CSV con columnas no permitidas',
              html: `
                <div style="text-align:left">
                  El archivo contiene columnas no permitidas:<br/>
                  <ul style="margin-top:8px; padding-left:18px;">
                    ${extraColumns.map(col => `<li><b>${col}</b></li>`).join('')}
                  </ul>
                  <small style="display:block; margin-top:12px;">
                    Solo se permiten estas columnas:<br/>
                    <b>detail, amount, date, project_id, temporalities_id, month</b>
                  </small>
                </div>
              `,
              icon: 'error',
              confirmButtonText: 'Corregir CSV',
              confirmButtonColor: '#CDEA80',
            })
            return
          }

          const currentDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
          const updatedData = result.data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((row: any, rowIndex: number) => {
          
            const errors: string[] = []
            const projectId = Number(row.project_id)
            if (!row.project_id || !Number.isInteger(projectId) || projectId <= 0) {
              errors.push('project_id debe ser un número entero positivo')
            }

    
            const temporalityId = Number(row.temporalities_id)
            if (!row.temporalities_id || !Number.isInteger(temporalityId) || temporalityId < 1 || temporalityId > 5) {
              errors.push('temporalities_id debe ser un número entre 1 y 5')
            }

        
            const amount = Number(row.amount)
            if (!row.amount || !Number.isFinite(amount) || amount <= 0) {
              errors.push('amount debe ser un número positivo')
            }

    
            if (!row.detail || !String(row.detail).trim()) {
              errors.push('detail no puede estar vacío')
            }

          
            if (errors.length > 0) {
              return { 
                error: true, 
                rowIndex: rowIndex + 1,
                errors,
                row 
              }
            }

      
            const resolvedMonth = row.month && String(row.month).trim() ? String(row.month).trim() : csvMonth

            let resolvedDate = row.date && String(row.date).trim() ? String(row.date).trim() : ''

              const parsedDate = parseAnyDate(resolvedDate || resolvedMonth)
              if (!parsedDate) {
                errors.push('date tiene formato inválido (se aceptan: DD/MM/YYYY, YYYY-MM-DD, mmm-yy, serial Excel)')
              } else {
                resolvedDate = parsedDate
              }

          
              const monthPattern = /^[a-z]{3}-\d{2}$/i
              if (!monthPattern.test(resolvedMonth)) {
                errors.push('month debe tener formato mmm-yy (ej: may-26)')
              }

          
              if (errors.length > 0) {
                return { 
                  error: true, 
                  rowIndex: rowIndex + 1,
                  errors,
                  row 
                }
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
                  project_id: Number(row.project_id),
                  date: resolvedDate,
                  temporalities_id: row.temporalities_id,
                  month: resolvedMonth,
                  created_at: currentDate,
                }
              } else {
                return null
              }
            })
            .filter((item): item is any => item !== null)

  
            const validRows = updatedData.filter((item: any) => !item?.error)
            const errorRows = updatedData.filter((item: any) => item?.error)

           
            if (errorRows.length > 0) {
     
              const errorsByType: Record<string, number[]> = {}
              
              errorRows.forEach((err: any) => {
                err.errors.forEach((errorMsg: string) => {
                  if (!errorsByType[errorMsg]) {
                    errorsByType[errorMsg] = []
                  }
                  errorsByType[errorMsg].push(err.rowIndex)
                })
              })

              const errorSummary = Object.entries(errorsByType).map(([errorMsg, rows]) => {
                const rowList = rows.length > 10 
                  ? `${rows.slice(0, 10).join(', ')}... (y ${rows.length - 10} más)`
                  : rows.join(', ')
                
                return `
                  <li style="margin-bottom:12px;">
                    <b>${errorMsg}</b><br/>
                    <span style="color:#666; font-size:0.9em;">Filas afectadas: ${rowList}</span>
                  </li>
                `
              }).join('')

              await Swal.fire({
                title: `Se encontraron ${errorRows.length} fila${errorRows.length > 1 ? 's' : ''} con errores`,
                html: `
                  <div style="text-align:left; max-height:400px; overflow-y:auto;">
                    <p style="margin-bottom:12px; font-weight:500;">Errores detectados:</p>
                    <ul style="padding-left:20px; margin-bottom:16px;">
                      ${errorSummary}
                    </ul>
                    <hr style="margin:16px 0; border-color:#e5e7eb;"/>
                    <div style="background:#f9fafb; padding:12px; border-radius:6px;">
                      <p style="font-weight:600; margin-bottom:8px;">Formato correcto del CSV:</p>
                      <small style="line-height:1.8;">
                        <b>Nombres de columnas (en inglés):</b><br/>
                        • <b>project_id:</b> número entero positivo<br/>
                        • <b>temporalities_id:</b> 1-5 (1:Mensual, 2:Trimestral, 3:Cuatrimestral, 4:Semestral, 5:Anual)<br/>
                        • <b>amount:</b> número positivo (sin puntos ni comas)<br/>
                        • <b>date:</b> formato DD/MM/YYYY<br/>
                        • <b>month:</b> formato mmm-yy (ej: dic-25)<br/>
                        • <b>detail:</b> texto no vacío
                      </small>
                    </div>
                  </div>
                `,
                icon: 'error',
                confirmButtonText: 'Corregir CSV',
                confirmButtonColor: '#CDEA80',
                width: '650px',
              })
              return
            }

            if (validRows.length > 0) {
              setProjectsIncome(validRows as IIncome[])
            } else {
            await Swal.fire({
              title: 'Archivo inválido',
              text: 'Revisa el CSV. "project_id", "date", "temporalities_id" y "amount" son obligatorios.',
              icon: 'warning',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#CDEA80',
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
            confirmButtonColor: '#CDEA80',
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
 
    const yearNum = Number(yy)
    if (Number.isNaN(yearNum)) return null
    const year = 2000 + yearNum
    return { year, monthIndex }
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

  const parseAnyDate = (raw: string | undefined | null): string | null => {
    if (!raw) return null
    const s = String(raw).trim()
    if (!s) return null

    // Serial numérico de Excel (ej: 45678)
    if (/^\d{4,5}$/.test(s)) {
      const d = dayjs(new Date(1899, 11, 30)).add(parseInt(s, 10), 'day')
      return d.isValid() ? d.format('YYYY-MM-DD') : null
    }
    // mmm-yy (ej: may-26)
    if (/^[a-z]{3}-\d{2}$/i.test(s)) {
      return firstDayFromMonthString(s, 'YYYY-MM-DD')
    }
    // DD/MM/YYYY o D/M/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const [d, m, y] = s.split('/')
      const parsed = dayjs(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`)
      return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null
    }
    // DD/MM/YY
    if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(s)) {
      const [d, m, y] = s.split('/')
      const parsed = dayjs(`20${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`)
      return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null
    }
    // YYYY-MM-DD (ISO)
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const parsed = dayjs(s)
      return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null
    }
    // DD-MM-YYYY con guiones
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) {
      const [d, m, y] = s.split('-')
      const parsed = dayjs(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`)
      return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null
    }
    // Fallback
    const fallback = dayjs(s)
    return fallback.isValid() ? fallback.format('YYYY-MM-DD') : null
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
     
      {viewMode === 'upload' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Selecciona el Mes para configurar el formato de tu archivo CSV.
          </label>
          <input
            type="month"
            name="csv_month"
            value={csvMonth ? (() => {
              const parsed = parseMonthString(csvMonth)
              if (!parsed) return ''
              const { year, monthIndex } = parsed
              return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
            })() : ''}
            onChange={(e) => {
              if (e.target.value) {
                const [year, month] = e.target.value.split('-')
                const monthIndex = parseInt(month) - 1
                const monthAbbr = MONTHS_ES[monthIndex]
                const yy = year.slice(-2)
                const monthStr = `${monthAbbr}-${yy}`
                setCsvMonth(monthStr)
              }
            }}
            className="outline-none block w-full md:w-auto rounded-md border px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400"
          />
          <div className="mt-3">
             
            <small className="block text-xs text-gray-500 mt-1">
              <b>Columnas requeridas:</b> Los nombres de las columnas están predefinidos en el formato CSV. Por favor, no editarlos.<br/>
              <b>Formato fecha:</b> El formato correspondiente para el campo fecha es DD/MM/YYYY.<br/>                
              <b>Temporalidades:</b> 1-Mensual, 2-Trimestral, 3-Cuatrimestral, 4-Semestral, 5-Anual.
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
                Seleccione el Mes
              </label>
              <input
                type="month"
                name="date"
                value={formData.date ? dayjs(formData.date).format('YYYY-MM') : ''}
                onChange={(e) => {
                  const selectedYearMonth = e.target.value; 
                  if (selectedYearMonth) {
                    const isoDate = `${selectedYearMonth}-01`;
                    setFormData({
                      ...formData,
                      date: isoDate,
                    });
                  }
                }}
                onClick={(e) => {
                  e.currentTarget.showPicker();
                }}
                className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 sm:text-sm sm:leading-6 cursor-pointer"
              />
            </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            className={`rounded-md px-3 py-2 text-sm font-semibold text-[#303031] shadow-sm
              ${canSave
                ? 'bg-[#CDEA80] hover:bg-[#BDDEFF] hover:text-black'
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
              <div className="flex gap-2 items-center">
                <input
                  id="file_input"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="block w-full text-sm p-2 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                />
                {fileSelected && (
                  <button
                    type="button"
                    onClick={() => {
                      setProjectsIncome([])
                      setFileSelected(false)
                      const fileInput = document.getElementById('file_input') as HTMLInputElement
                      if (fileInput) fileInput.value = ''
                    }}
                    className="[#303031]space-nowrap rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-[#303031] shadow-sm hover:bg-red-500"
                    title="Limpiar archivo cargado"
                  >
                    ✕ Limpiar
                  </button>
                )}
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
