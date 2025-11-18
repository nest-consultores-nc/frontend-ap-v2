// PaginationProjectsTable.tsx (DESPUÉS)
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
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const firstPages = range(1, Math.min(boundaryCount, totalPages))
  const lastPages = range(
    Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
    totalPages
  )

  const start = Math.max(
    Math.min(
      current - siblingCount,
      totalPages - boundaryCount - siblingCount * 2 - 1
    ),
    boundaryCount + 2
  )
  const end = Math.min(
    Math.max(
      current + siblingCount,
      boundaryCount + siblingCount * 2 + 2
    ),
    lastPages[0] - 2
  )

  const middle =
    start <= end ? (range(start, end) as PageItem[]) : []

  const showLeftEllipsis = start > firstPages[firstPages.length - 1] + 1
  const showRightEllipsis = end < lastPages[0] - 1

  return [
    ...firstPages,
    ...(showLeftEllipsis ? (['…'] as PageItem[]) : []),
    ...middle,
    ...(showRightEllipsis ? (['…'] as PageItem[]) : []),
    ...lastPages,
  ].filter((x, idx, arr) => arr.indexOf(x) === idx)
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
    'flex items-center justify-center h-9 px-3 text-sm border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md'
  const numberBtn =
    'h-9 min-w-9 px-3 text-sm border border-gray-300 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md'

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
                        ? `${numberBtn} bg-[#3E3378] text-white border-[#3E3378]`
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
