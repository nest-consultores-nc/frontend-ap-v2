interface Props {
  active: string
  handleChangeActiveTab: (tab: string) => void
}

export function TabsEditar({ active, handleChangeActiveTab }: Props) {
  const base = 'inline-block px-4 py-3 rounded-lg transition-colors'
  const getClasses = (tab: string) =>
    active === tab
      ? `${base} bg-[#3E3378] text-white cursor-default`
      : `${base} bg-[#89CCDC] text-black hover:bg-[#89CCDC] hover:text-white`

  return (
    <div className="flex flex-wrap gap-2 text-sm font-medium text-center text-gray-500 mt-16">
      <button
        type="button"
        aria-selected={active === 'desembolsos'}
        onClick={() => handleChangeActiveTab('desembolsos')}
        className={getClasses('desembolsos')}
      >
        Desembolsos
      </button>

      <button
        type="button"
        aria-selected={active === 'ingresos'}
        onClick={() => handleChangeActiveTab('ingresos')}
        className={getClasses('ingresos')}
      >
        Ingresos
      </button>

      <button
        type="button"
        aria-selected={active === 'salarios'}
        onClick={() => handleChangeActiveTab('salarios')}
        className={getClasses('salarios')}
      >
        Salarios
      </button>

      <button
        type="button"
        aria-selected={active === 'dedicaciones'}
        onClick={() => handleChangeActiveTab('dedicaciones')}
        className={getClasses('dedicaciones')}
      >
        Dedicaciones
      </button>
    </div>
  )
}
