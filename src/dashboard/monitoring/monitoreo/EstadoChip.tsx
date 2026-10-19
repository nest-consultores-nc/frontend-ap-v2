import { ESTADO, Estado } from './model'

/** Estado de dedicación con color, ícono y texto (nunca solo color) */
export function EstadoChip({ estado }: { estado: Estado }) {
  const e = ESTADO[estado]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ color: e.color, background: e.fondo }}
    >
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] text-white"
        style={{ background: e.color }}
      >
        {e.icon}
      </span>
      {e.label}
    </span>
  )
}
