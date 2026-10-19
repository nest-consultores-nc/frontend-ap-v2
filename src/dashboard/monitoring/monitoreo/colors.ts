// Colores del reporte de Power BI "01. Monitoreo_Polaris" (mismo tema "Custom" del financiero)

/** Barras de ranking: la mayor en coral y el resto en coral claro (formato condicional del reporte) */
export const RANKING = { top: '#FF8F7D', resto: '#FFC7BE' }

/**
 * Colores del tema en el orden que Power BI los asigna a clientes y trabajadores.
 * Se omiten #EDEBE5 y #FFFFFF del tema porque no se ven sobre fondo blanco.
 */
export const THEME_SERIES = [
  '#303030', '#FF735C', '#CDEA80', '#BDDEFF', '#4A4A4A', '#8A8A8A', '#3599B8', '#DFBFBF',
  '#4AC5BB', '#5F6B6D', '#FB8281', '#F4D25A', '#7F898A', '#A4DDEE', '#FDAB89', '#B687AC',
  '#28738A', '#A78F8F', '#168980', '#293537', '#BB4A4A', '#B59525', '#475052', '#6A9FB0',
]

/** Color fijo por id (no cambia al filtrar) */
export const colorById = (ids: number[], id: number) => {
  const i = ids.indexOf(id)
  return THEME_SERIES[(i < 0 ? id : i) % THEME_SERIES.length]
}
