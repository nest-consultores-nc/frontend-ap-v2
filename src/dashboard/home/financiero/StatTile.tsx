interface Props {
  label: string
  value: string
  hint?: string
  hero?: boolean
  /** color del valor y de la barra lateral (como las tarjetas de Power BI) */
  color?: string
}

/** Indicador numérico (reemplaza las tarjetas de Power BI) */
export function StatTile({ label, value, hint, hero = false, color }: Props) {
  return (
    <div
      className="bg-white rounded-xl ring-1 ring-black/10 px-4 py-3 min-w-0 border-l-4"
      style={{ borderLeftColor: color ?? 'transparent' }}
    >
      <p className="text-xs font-medium text-[#52514e]">{label}</p>
      <p
        className={`font-semibold mt-1 truncate ${hero ? 'text-3xl md:text-4xl' : 'text-2xl'}`}
        style={{ color: color ?? '#252423' }}
        title={value}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-[#898781] mt-1">{hint}</p>}
    </div>
  )
}
