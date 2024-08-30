export default function HeaderPages({
  titlePage,
  subTitlePage,
}: {
  titlePage: string
  subTitlePage: string
}) {
  return (
    <header>
      <h2 className="text-base font-semibold leading-7 text-gray-900">
        {titlePage}
      </h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">{subTitlePage}</p>
    </header>
  )
}
