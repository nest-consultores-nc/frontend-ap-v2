import { Loading } from '../../assets/Loading'

export function LoadingCosteo({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center justify-center flex-col mt-8 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
      <p className="text-indigo-700 font-medium"> {title} </p>
      <p className="my-2 text-sm text-indigo-600 text-center">{subtitle}</p>
      <Loading color="blue" />
    </div>
  )
}
