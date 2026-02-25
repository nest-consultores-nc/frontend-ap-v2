export type TabKey = 'utilidad' | 'ingresos' | 'costeo-mensual'

interface Props {
  active: TabKey
  handleChangeActiveTab: (tab: TabKey) => void
  className?: string
}

export function TabsCosteo({ active, handleChangeActiveTab, className = '' }: Props) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'utilidad',        label: 'Utilidad' },
    { key: 'ingresos',        label: 'Ingresos' },
    { key: 'costeo-mensual',  label: 'Costeo Mensual' },
  ]

  return (
    <div className={`mb-8 ${className}`}>
      <div className="border-b border-gray-200">
        <nav
          role="tablist"
          aria-label="Tabs de Costeo"
          className="flex flex-wrap -mb-px gap-x-1"
        >
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active === key}
              onClick={() => handleChangeActiveTab(key)}
              className={`
                relative px-6 py-3 text-sm font-semibold transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CDEA80] focus-visible:ring-offset-2
                ${
                  active === key
                    ? 'text-[#303031] border-b-2 border-[#CDEA80]'
                    : 'text-gray-600 hover:text-[#303031] hover:border-b-2 hover:border-gray-300'
                }
              `}
            >
              {label}
              {active === key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CDEA80] animate-[slideIn_0.2s_ease-out]" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}