export type TabKey = 'utilidad' | 'ingresos' | 'costeo-mensual'

interface Props {
  active: TabKey
  handleChangeActiveTab: (tab: TabKey) => void
  className?: string
}

export function TabsCosteo({ active, handleChangeActiveTab, className = '' }: Props) {
 
  const baseBtn =
    'inline-block px-4 py-3 rounded-lg text-sm font-medium transition ' +
    'hover:bg-[#89CCDC] hover:text-[#303031] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3E3378]'
  const activeBtn = 'text-white bg-[#3E3378]'
  const inactiveBtn = 'text-gray-600'

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'utilidad',        label: 'Utilidad' },
    { key: 'ingresos',        label: 'Ingresos' },
    { key: 'costeo-mensual',  label: 'Costeo Mensual' },
  ]

  return (
    <div
      role="tablist"
      aria-label="Tabs de Costeo"
      className={`flex flex-wrap translate-y-12 items-center gap-2 text-sm font-medium text-center mb-6 ${className}`}
    >
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={active === key}
          onClick={() => handleChangeActiveTab(key)}
          className={`${baseBtn} ${active === key ? activeBtn : inactiveBtn}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
