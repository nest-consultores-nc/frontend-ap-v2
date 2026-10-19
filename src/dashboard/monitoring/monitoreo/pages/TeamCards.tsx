import { fmt } from '../../../home/financiero/theme'
import { ESTADO, TeamSummary } from '../model'

interface Props {
  summary: TeamSummary
  labels: { completos: string; incompletos: string; sin: string }
  cumplimientoColor: string
  /** texto bajo el % (semana o mes que se está viendo) */
  hint: string
}

/** Tarjetas de cumplimiento del equipo (reemplazan las tarjetas de Power BI) */
export function TeamCards({ summary, labels, cumplimientoColor, hint }: Props) {
  const tiles = [
    { label: labels.completos, value: summary.completos, estado: ESTADO.completo },
    { label: labels.incompletos, value: summary.incompletos, estado: ESTADO.incompleto },
    { label: labels.sin, value: summary.sinRegistro, estado: ESTADO.sin },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        className="bg-white rounded-xl ring-1 ring-black/10 px-4 py-3 border-l-4 col-span-2 md:col-span-1"
        style={{ borderLeftColor: cumplimientoColor }}
      >
        <p className="text-xs font-medium text-[#52514e]">% Cumplimiento del equipo</p>
        <p className="text-3xl font-semibold mt-1" style={{ color: cumplimientoColor }}>
          {fmt.pct(summary.cumplimiento)}
        </p>
        <p className="text-xs text-[#898781] mt-1">
          {summary.completos} de {summary.activos} trabajadores activos · {hint}
        </p>
      </div>
      {tiles.map((t) => (
        <div
          key={t.label}
          className="bg-white rounded-xl ring-1 ring-black/10 px-4 py-3 border-l-4"
          style={{ borderLeftColor: t.estado.color }}
        >
          <p className="text-xs font-medium text-[#52514e] flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] text-white"
              style={{ background: t.estado.color }}
            >
              {t.estado.icon}
            </span>
            {t.label}
          </p>
          <p className="text-3xl font-semibold mt-1 text-[#252423]">{t.value}</p>
          <p className="text-xs text-[#898781] mt-1">
            {summary.activos ? fmt.pct(t.value / summary.activos) : '—'} del equipo
          </p>
        </div>
      ))}
    </div>
  )
}
