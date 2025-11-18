interface Props {
  active: string
  handleChangeActiveTab: (tab: string) => void
}
export function TabsTableDedications({ active, handleChangeActiveTab }: Props) {
  return (
    <div className="flex flex-wrap text-sm font-medium text-center">
      <button
        onClick={() => handleChangeActiveTab('registrar-horas')}
        className={
          'inline-block px-4 py-3 rounded-lg hover:bg-[#89CCDC] hover:text-[#303031] ' +
          (active === 'registrar-horas'
            ? 'text-white bg-[#3E3378]'
            : 'hover:text-[#303031]')
        }
      >
        Registrar Horas
      </button>
      <button
        onClick={() => handleChangeActiveTab('historial-registros')}
        className={
          'inline-block px-4 py-3 translate-x-2 rounded-lg hover:bg-[#89CCDC] hover:text-[#303031]  ' +
          (active === 'historial-registros'
            ? 'text-white bg-[#3E3378]'
            : 'hover:text-[#303031]')
        }
      >
        Ver Historial de Registros
      </button>
    </div>
  )
}
