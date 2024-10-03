interface Props {
  active: string
  handleChangeActiveTab: (tab: string) => void
}
export function TabsCosteo({ active, handleChangeActiveTab }: Props) {
  return (
    <div className="flex flex-wrap text-sm font-medium text-center text-gray-500 ">
      <button
        onClick={() => handleChangeActiveTab('utilidad')}
        className={
          'inline-block px-4 py-3 rounded-lg hover:text-gray-900  ' +
          (active === 'utilidad' ? 'text-white bg-indigo-600' : 'text-gray-500')
        }
      >
        Utilidad
      </button>
      <button
        onClick={() => handleChangeActiveTab('ingresos')}
        className={
          'inline-block px-4 py-3 rounded-lg hover:text-gray-900  ' +
          (active === 'ingresos' ? 'text-white bg-indigo-600' : 'text-gray-500')
        }
      >
        Ingresos
      </button>
      <button
        onClick={() => handleChangeActiveTab('costeo-mensual')}
        className={
          'inline-block px-4 py-3 rounded-lg hover:text-gray-900  ' +
          (active === 'costeo-mensual'
            ? 'text-white bg-indigo-600'
            : 'text-gray-500')
        }
      >
        Costeo Mensual
      </button>
    </div>
  )
}
