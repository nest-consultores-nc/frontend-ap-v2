import { useEffect, useState } from 'react'
import { IDedicationsByUserId } from '../../interfaces/dedications/dedications.interfaces'
import { CancelIcon, CheckIcon, DeleteIcon, EditIcon } from '../../assets'
import { formatWeekWithLabel } from '../../functions/getWeeksAround'

interface Props {
  weeks: string[]
  dedications: IDedicationsByUserId[] | undefined
  onEditDedication: (dedication: IDedicationsByUserId) => void
  onDeleteDedication: (dedicationId: number) => void
  editingDedication: IDedicationsByUserId | null
  onSaveEditDedication: (dedication: IDedicationsByUserId) => void
  onCancelEdit: () => void
}

export function TableDedications({
  weeks,
  dedications,
  onEditDedication,
  onDeleteDedication,
  editingDedication,
  onSaveEditDedication,
  onCancelEdit,
}: Props) {
  const [editValue, setEditValue] = useState<string>('')
  const [editDate, setEditDate] = useState<string>('')

  useEffect(() => {
    if (editingDedication) {
      setEditValue(editingDedication.dedicated.toString())
      setEditDate(editingDedication.week)
    }
  }, [editingDedication])

  const handleSaveClick = () => {
    if (editingDedication) {
      const updatedDedication = {
        ...editingDedication,
        dedicated: parseFloat(editValue) || 0,
        week: editDate,
      }
      onSaveEditDedication(updatedDedication)
    }
  }

  const preventOverMax: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
  const nav = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End','Enter']
  const disallowed = ['e','E','+','-','.']  
  if (disallowed.includes(e.key)) { e.preventDefault(); return }
  if (nav.includes(e.key)) return
  if (!/^\d$/.test(e.key)) { e.preventDefault(); return }

  const el = e.currentTarget
  const { value, selectionStart, selectionEnd } = el
  if (selectionStart == null || selectionEnd == null) return
  const next = value.slice(0, selectionStart) + e.key + value.slice(selectionEnd)
  if (next === '') return
  const num = Number(next)
  if (!Number.isFinite(num) || num > 100) e.preventDefault()
  }

  const blockPasteOverMax: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    const paste = e.clipboardData.getData('text') ?? ''
    if (!/^\d+(\.\d+)?$/.test(paste)) { e.preventDefault(); return }
    const el = e.currentTarget
    const { value, selectionStart, selectionEnd } = el
    const next = value.slice(0, selectionStart ?? value.length) + paste + value.slice(selectionEnd ?? value.length)
    const num = Number(next)
    if (!Number.isFinite(num) || num > 100 || num < 0) e.preventDefault()
  }


  // El backend ya entrega la semana como "DD-MM-AAAA"; se normaliza por si llega en ISO.
  function displayWeekForCard(raw: string): string {
    if (!raw) return ''
    const dateOnly = raw.split('T')[0]
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      const [y, m, d] = dateOnly.split('-')
      return `${d}-${m}-${y}`
    }
    return dateOnly
  }

  // Si la semana guardada no está en el rango del selector, se agrega para que
  // el selector no salte a otra semana al editar.
  const editWeekOptions =
    editDate && !weeks.includes(editDate) ? [editDate, ...weeks] : weeks


  const detectDifferentWeeks = (): string[] | null => {
    if (!dedications || dedications.length === 0) return null
    
    const uniqueWeeks = new Set<string>()
    dedications.forEach(dedication => {
      const displayWeek = displayWeekForCard(dedication.week)
      uniqueWeeks.add(displayWeek)
    })
    
    if (uniqueWeeks.size > 1) {
      return Array.from(uniqueWeeks)
    }
    return null
  }

  const differentWeeks = detectDifferentWeeks()

  return (
    <div className="border relative sm:rounded-lg my-4">

    {differentWeeks && differentWeeks.length > 1 && (
      <div className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 font-bold text-sm">i</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-blue-900 mb-1">
            Atención: Semanas diferentes detectadas
          </p>
          <p className="text-sm text-blue-800">
            Has registrado dedicaciones para diferentes semanas:{' '}
            <span className="font-semibold">
              {differentWeeks.join(', ')}
            </span>
            . Para consolidar correctamente, todas las dedicaciones deben corresponder a la misma semana. 
            Por favor, edita las fechas en la tabla para unificarlas a una sola semana.
          </p>
        </div>
      </div>
    )}


      <div className="flex items-center justify-between">
        <p className="px-6 py-4 font-medium text-gray-900 [#303031]space-nowrap">
          Dedicación de Horas
        </p>
        <p className="px-6 py-4 font-medium text-gray-900 [#303031]space-nowrap -translate-x-4">
          Total dedicación:{' '}
          {dedications?.reduce((acc, current) => acc + current.dedicated, 0)} %
        </p>
      </div>
      <table className="w-full hidden sm:table table-auto text-sm text-left rtl:text-right text-gray-700">

        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">
              Nombre
            </th>
            <th scope="col" className="px-6 py-3">
              Cliente - Nombre Proyecto
            </th>
            <th scope="col" className="px-6 py-3">
              Dedicación
            </th>
            <th scope="col" className="px-6 py-3">
              Semana
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {dedications?.map((dedication) => (
            <tr key={dedication.id}>
                <td className="px-6 py-4 [#303031]space-normal break-words align-top">{dedication.user_name}</td>
                <td className="px-6 py-4 [#303031]space-normal break-words align-top">
                  {dedication.client_name || 'Cliente Desconocido'} - {dedication.project_name || 'Proyecto No Definido'}
                </td>

              <td className="px-6 py-4">
                {editingDedication?.id === dedication.id ? (
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => {
                      const val = e.target.value
                   
                      if (val === '' || (/^\d+$/.test(val) && Number(val) >= 0 && Number(val) <= 100)) {
                        setEditValue(val)
                      }
                    }}
                    onKeyDown={preventOverMax}
                    onPaste={blockPasteOverMax}
                    min={0}
                    max={100}
                    step={1}
                    inputMode="numeric"
                    className="border rounded px-2 py-1 w-full"
                    placeholder="0–100"
                  />

                ) : (
                  dedication.dedicated
                )}
              </td>
              <td className="px-6 py-4">
              {editingDedication?.id === dedication.id ? (
                <select
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                >
                  {editWeekOptions.map((week) => (
                    <option key={week} value={week}>
                      {formatWeekWithLabel(week)}
                    </option>
                  ))}
                </select>
              ) : (
                formatWeekWithLabel(displayWeekForCard(dedication.week))
              )}
            </td>
              <td className="px-6 py-4 flex justify-center space-x-2">
                {editingDedication?.id === dedication.id ? (
                  <>
                    <button
                      onClick={handleSaveClick}
                      className="text-green-600 hover:text-green-800"
                    >
                      <CheckIcon />
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="text-red-600 hover:text-red-800"
                    >
                      <CancelIcon />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onEditDedication(dedication)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <EditIcon />
                  </button>
                )}
                <button
                  onClick={() => onDeleteDedication(dedication.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <DeleteIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="sm:hidden space-y-4 px-2">
        {dedications?.map((dedication) => (
          <div key={dedication.id} className="white border rounded-xl p-4 shadow flex flex-col gap-1">
            <div><span className="font-semibold">Nombre:</span> {dedication.user_name}</div>
            <div className="break-words">
              <span className="font-semibold">Proyecto:</span>{' '}
              {dedication.client_name || 'Cliente Desconocido'} - {dedication.project_name || 'Proyecto No Definido'}
            </div>
            <div>
              <span className="font-semibold">Dedicación:</span>{' '}
              {editingDedication?.id === dedication.id ? (
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={preventOverMax}
                  onPaste={blockPasteOverMax}
                  min={0}
                  max={100}
                  step={1}
                  inputMode="numeric"
                  className="border rounded px-2 py-1 w-full "
                  placeholder="0–100"
                />
              ) : (
                `${dedication.dedicated} %`
              )}
            </div>
              <div>
                <span className="font-semibold">Semana:</span>{' '}
                {editingDedication?.id === dedication.id ? (
                  <select
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                  >
                    {editWeekOptions.map((week) => (
                      <option key={week} value={week}>{formatWeekWithLabel(week)}</option>
                    ))}
                  </select>
                ) : (
                  formatWeekWithLabel(displayWeekForCard(dedication.week))
                )}
              </div>


            <div className="flex gap-2 mt-2">
              {editingDedication?.id === dedication.id ? (
                <>
                  <button onClick={handleSaveClick} className="text-green-600 hover:text-green-800"><CheckIcon /></button>
                  <button onClick={onCancelEdit} className="text-red-600 hover:text-red-800"><CancelIcon /></button>
                </>
              ) : (
                <button onClick={() => onEditDedication(dedication)} className="text-blue-600 hover:text-blue-800"><EditIcon /></button>
              )}
              <button onClick={() => onDeleteDedication(dedication.id)} className="text-red-600 hover:text-red-800"><DeleteIcon /></button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
