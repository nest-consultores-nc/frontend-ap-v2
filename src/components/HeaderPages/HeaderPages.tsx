import { ReactNode } from 'react';
export function HeaderPages({
  titlePage,
  subTitlePage,
}: {
  titlePage: string
  subTitlePage: ReactNode
}) {
  return (
    <header>

      
        <h2 className="mt-14 md:mt-4 text-base font-semibold leading-7 text-gray-900">
          {titlePage}
        </h2>

      <p className="mt-1 text-sm leading-6 text-gray-600">{subTitlePage}</p>
    </header>
  )
}
