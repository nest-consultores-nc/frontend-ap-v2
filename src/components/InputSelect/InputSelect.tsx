import { IClient } from '@/app/interfaces/clients'
import { ICategory } from '@/app/interfaces/projects/project-category.interface'
import { IType } from '@/app/interfaces/projects/project-type.interface'

interface Props {
  title: string
  options: IClient[] | ICategory[] | IType[]
  name: string
  value: number
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export default function InputSelect({
  title,
  options,
  name,
  value,
  onChange,
}: Props) {
  return (
    <div className="col-span-full">
      <label className="block text-sm font-medium leading-6 text-gray-900">
        {title}
      </label>
      <div className="mt-2">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          {options.map((option) => {
            if ('client_name' in option) {
              return (
                <option key={option.id} value={option.id}>
                  {option.client_name}
                </option>
              )
            } else if ('category_name' in option) {
              return (
                <option key={option.id} value={option.id}>
                  {option.category_name}
                </option>
              )
            } else if ('type_name' in option) {
              return (
                <option key={option.id} value={option.id}>
                  {option.type_name}
                </option>
              )
            } else {
              return null
            }
          })}
        </select>
      </div>
    </div>
  )
}
