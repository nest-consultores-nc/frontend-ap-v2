import { IClient } from '../../interfaces/clients'
import { ICategory } from '../../interfaces/projects/project-category.interface'
import { IType } from '../../interfaces/projects/project-type.interface'

interface Props {
  title: string
  options: IClient[] | ICategory[] | IType[]
  defaultOption: string
  name: string
  value: number
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export function InputSelect({
  title,
  options,
  name,
  value,
  onChange,
  defaultOption,
}: Props) {
  return (
    <div className="col-span-full">
      <label className="block text-sm font-medium leading-6 text-gray-900">
        {title}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm   placeholder:text-gray-400 focus:border-gray-40  sm:text-sm sm:leading-6"
      >
        <option value="">{defaultOption}</option>
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
  )
}
