import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { IDedicationsByUserId } from '../../interfaces/dedications/dedications.interfaces'

interface Props {
  weeks: string[]
  dedications: IDedicationsByUserId[] | undefined
  onEditDedication: (dedication: IDedicationsByUserId) => void
  onDeleteDedication: (dedicationId: number) => void
  editingDedication: IDedicationsByUserId | null
  onSaveEditDedication: (dedication: IDedicationsByUserId) => void
  onCancelEdit: () => void
  setCanFinish: Dispatch<SetStateAction<boolean>>
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

  return (
    <div className="border relative sm:rounded-lg my-4">
      <div className="flex items-center justify-between">
        <p className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
          Dedicación de Horas
        </p>
        <p className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
          Total dedicación:{' '}
          {dedications?.reduce((acc, current) => acc + current.dedicated, 0)} %
        </p>
      </div>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
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
              <td className="px-6 py-4">{dedication.user_name}</td>
              <td className="px-6 py-4">
                {dedication.client_name} - {dedication.project_name}
              </td>
              <td className="px-6 py-4">
                {editingDedication?.id === dedication.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="border rounded px-2 py-1 w-full"
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
                  dedication.week
                )}
              </td>
              <td className="px-6 py-4 flex justify-center space-x-2">
                {editingDedication?.id === dedication.id ? (
                  <>
                    <button
                      onClick={handleSaveClick}
                      className="text-green-600 hover:text-green-800"
                    >
                      <img
                        src="/assets/save.svg"
                        alt="save"
                        width={20}
                        height={20}
                        className="inline-block"
                      />
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="text-red-600 hover:text-red-800"
                    >
                      <img
                        src="/assets/cancel.svg"
                        alt="cancel"
                        width={20}
                        height={20}
                        className="inline-block"
                      />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onEditDedication(dedication)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <img
                      src="/assets/edit.svg"
                      alt="edit"
                      width={20}
                      height={20}
                      className="inline-block"
                    />
                  </button>
                )}
                <button
                  onClick={() => onDeleteDedication(dedication.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <img
                    src="/assets/delete.svg"
                    alt="delete"
                    width={20}
                    height={20}
                    className="inline-block"
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
