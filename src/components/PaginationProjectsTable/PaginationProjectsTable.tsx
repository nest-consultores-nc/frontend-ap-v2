import { useMemo } from 'react'

interface Props {
  totalProjects: number
  projectsPerPage: number
  currentPage: number
  paginate: (pageNumber: number) => void
}

type PageItem = number | '…'

function getPaginationRange(
  current: number,
  totalPages: number,
  siblingCount = 1,
  boundaryCount = 1
): PageItem[] {
  const range = (start: number, end: number): number[] =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i)

  
  const totalSlots = boundaryCount * 2 + siblingCount * 2 + 3
  if (totalPages <= totalSlots) {
    return range(1, totalPages)
  }

  const leftSiblingStart = Math.max(current - siblingCount, boundaryCount + 1)
  const rightSiblingEnd = Math.min(current + siblingCount, totalPages - boundaryCount)

  const showLeftEllipsis = leftSiblingStart > boundaryCount + 2
  const showRightEllipsis = rightSiblingEnd < totalPages - boundaryCount - 1

  const firstPages = range(1, boundaryCount)
  const lastPages = range(totalPages - boundaryCount + 1, totalPages)

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = range(1, Math.max(2 + siblingCount * 2 + boundaryCount, rightSiblingEnd))
    return [...new Set([...leftRange, ...lastPages])]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = range(Math.min(totalPages - 1 - siblingCount * 2 - boundaryCount, leftSiblingStart), totalPages)
    return [...new Set([...firstPages, '…' as PageItem, ...rightRange])]
  }

  return [
    ...firstPages,
    '…' as PageItem,
    ...range(leftSiblingStart, rightSiblingEnd),
    '…' as PageItem,
    ...lastPages,
  ]
}

export function PaginationProjectsTable({
  totalProjects,
  projectsPerPage,
  currentPage,
  paginate,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalProjects / projectsPerPage))

  const desktopPages = useMemo<PageItem[]>(
    () => getPaginationRange(currentPage, totalPages, 1, 1),
    [currentPage, totalPages]
  )

  const startItem = totalProjects === 0 ? 0 : (currentPage - 1) * projectsPerPage + 1
  const endItem = Math.min(currentPage * projectsPerPage, totalProjects)

  const goTo = (page: number) => {
    const safe = Math.min(Math.max(page, 1), totalPages)
    if (safe !== currentPage) paginate(safe)
  }

  const baseBtn =
    'flex items-center justify-center h-9 px-3 text-sm border border-gray-300 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-#BDDEFF disabled:opacity-50 disabled:cursor-not-allowed rounded-md'
  const numberBtn =
    'h-9 min-w-9 px-3 text-sm border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-#BDDEFF rounded-md'

  return (
    <div className="mt-5">
     
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="text-xs sm:text-sm text-gray-700">
          Mostrando{' '}
          <span className="font-semibold text-gray-900">{startItem}</span>
          {' '}–{' '}
          <span className="font-semibold text-gray-900">{endItem}</span>
          {' '}de{' '}
          <span className="font-semibold text-gray-900">{totalProjects}</span>
          {' '}proyectos
        </span>

  
        <nav className="sm:hidden" aria-label="Paginación móvil">
          <ul className="flex items-center gap-2">
            <li>
              <button
                aria-label="Página anterior"
                onClick={() => goTo(currentPage - 1)}
                disabled={currentPage === 1}
                className={baseBtn}
              >
                ←
              </button>
            </li>
            <li>
              <span
                aria-live="polite"
                className="text-xs text-gray-700 min-w-[90px] text-center"
              >
                Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
              </span>
            </li>
            <li>
              <button
                aria-label="Página siguiente"
                onClick={() => goTo(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={baseBtn}
              >
                →
              </button>
            </li>
          </ul>
        </nav>

  
        <nav className="hidden sm:block" aria-label="Paginación">
          <ul className="flex items-center gap-2">
            <li>
              <button
                aria-label="Primera página"
                onClick={() => goTo(1)}
                disabled={currentPage === 1}
                className={baseBtn}
              >
                «
              </button>
            </li>
            <li>
              <button
                aria-label="Página anterior"
                onClick={() => goTo(currentPage - 1)}
                disabled={currentPage === 1}
                className={baseBtn}
              >
                ‹
              </button>
            </li>

            {desktopPages.map((item, idx) => (
              <li key={`${item}-${idx}`}>
                {item === '…' ? (
                  <span className="px-2 text-gray-500 select-none">…</span>
                ) : (
                  <button
                    onClick={() => goTo(item as number)}
                    aria-current={item === currentPage ? 'page' : undefined}
                    className={
                      item === currentPage
                        ? `${numberBtn} bg-[#CDEA80] text-[#303031] border-[#CDEA80]`
                        : `${numberBtn} text-gray-700`
                    }
                  >
                    {item}
                  </button>
                )}
              </li>
            ))}

            <li>
              <button
                aria-label="Página siguiente"
                onClick={() => goTo(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={baseBtn}
              >
                ›
              </button>
            </li>
            <li>
              <button
                aria-label="Última página"
                onClick={() => goTo(totalPages)}
                disabled={currentPage === totalPages}
                className={baseBtn}
              >
                »
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
