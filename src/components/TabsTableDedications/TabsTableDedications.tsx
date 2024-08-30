interface Props {
  active: string
  handleChangeActiveTab: (tab: string) => void
}
export function TabsTableDedications({ active, handleChangeActiveTab }: Props) {
  return (
    <div className="flex flex-wrap text-sm font-medium text-center text-gray-500 ">
      <button
        onClick={() => handleChangeActiveTab('registrar-horas')}
        className={
          'inline-block px-4 py-3 rounded-lg hover:text-gray-900  ' +
          (active === 'registrar-horas'
            ? 'text-white bg-indigo-600'
            : 'text-gray-500')
        }
      >
        Registrar Horas
      </button>
      <button
        onClick={() => handleChangeActiveTab('historial-registros')}
        className={
          'inline-block px-4 py-3 rounded-lg hover:text-gray-900  ' +
          (active === 'historial-registros'
            ? 'text-white bg-indigo-600'
            : 'text-gray-500')
        }
      >
        Ver Historial de Registros
      </button>
    </div>
  )
}
