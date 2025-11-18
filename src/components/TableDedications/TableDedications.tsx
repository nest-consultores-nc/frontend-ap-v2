import { useEffect, useState } from 'react'
import { IDedicationsByUserId } from '../../interfaces/dedications/dedications.interfaces'
import { CancelIcon, CheckIcon, DeleteIcon, EditIcon } from '../../assets'

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


  function displayWeekForCard(raw: string): string {
    if (!raw) return ''

  
    const dateOnly = raw.split('T')[0]
    let ddmm = ''
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateOnly)) {
      ddmm = dateOnly
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      const [y, m, d] = dateOnly.split('-')
      ddmm = `${d}-${m}-${y}`
    } else {
      ddmm = dateOnly
    }

    if (weeks?.includes(ddmm)) return ddmm

    const [d, m, y] = ddmm.split('-').map(Number)
    if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return ddmm
    const dt = new Date(Date.UTC(y, m - 1, d))
    dt.setUTCDate(dt.getUTCDate() - 1)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(dt.getUTCDate())}-${pad(dt.getUTCMonth() + 1)}-${dt.getUTCFullYear()}`
  }



  return (
    <div className="border relative sm:rounded-lg my-4">
      <div className="flex items-center justify-between">
        <p className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
          Dedicación de Horas
        </p>
        <p className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap -translate-x-4">
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
                <td className="px-6 py-4 whitespace-normal break-words align-top">{dedication.user_name}</td>
                <td className="px-6 py-4 whitespace-normal break-words align-top">
                  {dedication.client_name || 'Cliente Desconocido'} - {dedication.project_name || 'Proyecto No Definido'}
                </td>

              <td className="px-6 py-4">
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
                  {weeks.map((week, index) => (
                    <option key={index} value={week}>
                      {week}
                    </option>
                  ))}
                </select>
              ) : (
                (() => {
                  const [day, month, year] = dedication.week.split('-').map(Number);
                  const date = new Date(year, month - 1, day);
                  date.setDate(date.getDate() - 1); 
                  return `${('0' + date.getDate()).slice(-2)}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
                })()
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
          <div key={dedication.id} className="bg-white border rounded-xl p-4 shadow flex flex-col gap-1">
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
                    {weeks.map((week, index) => (
                      <option key={index} value={week}>{week}</option>
                    ))}
                  </select>
                ) : (
                  displayWeekForCard(dedication.week)   
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
