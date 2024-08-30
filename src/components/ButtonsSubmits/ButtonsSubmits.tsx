interface ButtonsSubmitsProps {
  onAdd: () => void
  canFinish: boolean
  onFinish: () => void
}

export function ButtonsSubmits({
  onAdd,
  canFinish,
  onFinish,
}: ButtonsSubmitsProps) {
  return (
    <div className="mt-6 flex items-center justify-end gap-x-6">
      <button
        type="button"
        onClick={onAdd}
        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Agregar
      </button>
      <button
        type="button"
        onClick={onFinish}
        disabled={!canFinish}
        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Terminar Registro
      </button>
    </div>
  )
}
