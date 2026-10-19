import { useEffect, useState } from 'react'

/** Estado de la última actualización y botón "Actualizar" (para el encabezado oscuro) */
export function RefreshStatus({
  loading,
  updatedAt,
  onRefresh,
}: {
  loading: boolean
  updatedAt: Date | null
  onRefresh: () => void
}) {
  const [, tick] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => tick((n) => n + 1), 15_000)
    return () => window.clearInterval(t)
  }, [])

  const ago = updatedAt ? Math.round((Date.now() - updatedAt.getTime()) / 1000) : null
  const label =
    ago === null
      ? ''
      : ago < 30
        ? 'Actualizado recién'
        : ago < 3600
          ? `Actualizado hace ${Math.max(1, Math.round(ago / 60))} min`
          : `Actualizado a las ${updatedAt!.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/60" aria-live="polite">
        {loading ? 'Actualizando…' : label}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="h-9 px-3 flex items-center gap-2 rounded-lg bg-[#CDEA80] text-[#303031] text-sm font-semibold hover:brightness-95 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={loading ? 'animate-spin' : ''}
          aria-hidden="true"
        >
          <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
        Actualizar
      </button>
    </div>
  )
}
