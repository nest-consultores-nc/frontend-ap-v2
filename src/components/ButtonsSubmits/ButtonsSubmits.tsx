import { canFinishDedicated } from '../../functions/canFinishDedicated'
import { IDedicationsByUserId } from '../../interfaces/dedications/dedications.interfaces'

interface ButtonsSubmitsProps {
  onAdd: () => void
  onFinish: () => void
  disabledAdd: boolean
  data: IDedicationsByUserId[]
}

export function ButtonsSubmits({
  onAdd,
  onFinish,
  disabledAdd,
  data,
}: ButtonsSubmitsProps) {
  return (
    <div className="mt-6 flex items-center justify-end gap-x-6">
      <button
        type="button"
        onClick={onAdd}
        disabled={!disabledAdd}
        className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          disabledAdd
            ? 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600'
            : 'bg-indigo-400 cursor-not-allowed'
        }`}
      >
        Agregar
      </button>

      <button
        type="button"
        onClick={onFinish}
        disabled={canFinishDedicated(data) ? false : true}
        className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          canFinishDedicated(data)
            ? 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600'
            : 'bg-indigo-400 cursor-not-allowed'
        }`}
      >
        Terminar Registro
      </button>
    </div>
  )
}
