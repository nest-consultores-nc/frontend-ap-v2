 
type ViewMode = 'form' | 'upload'

export interface TabsViewModeProps {
  active: ViewMode
  onChange: (tab: ViewMode) => void
  labels?: {
    form?: string
    upload?: string
  }
  className?: string
}

export function TabsViewMode({
  active,
  onChange,
  labels = { form: 'Completar Formulario', upload: 'Subir Archivo' },
  className = '',
}: TabsViewModeProps) {
  const baseBtn =
    'inline-block px-4 py-3 rounded-lg text-sm font-medium transition hover:bg-[#89CCDC] hover:text-[#303031]'
  const activeBtn = 'text-white bg-[#3E3378]'
  const inactiveBtn = 'hover:text-[#303031]'

  return (
    <div className={`flex flex-wrap text-sm font-medium text-center mb-6 ${className}`}>
      <button
        type="button"
        onClick={() => onChange('form')}
        className={`${baseBtn} ${active === 'form' ? activeBtn : inactiveBtn}`}
      >
        {labels.form}
      </button>

      <button
        type="button"
        onClick={() => onChange('upload')}
        className={`${baseBtn} translate-x-2 ${active === 'upload' ? activeBtn : inactiveBtn}`}
      >
        {labels.upload}
      </button>
    </div>
  )
}
