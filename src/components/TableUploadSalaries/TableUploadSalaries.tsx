import { ISalaries } from '../../interfaces/salaries/salaries.interface'

export function TableUploadSalaries({ salaries }: { salaries: ISalaries[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 w-[25%]">
              ID Usuario
            </th>
            <th scope="col" className="px-6 py-3 w-[25%]">
              Detalle
            </th>
            <th scope="col" className="px-6 py-3 w-[25%]">
              Salario
            </th>
            <th scope="col" className="px-6 py-3 w-[25%]">
              Fecha
            </th>
          </tr>
        </thead>
        <tbody>
          {salaries &&
            salaries.map((user, index) => (
              <tr key={index} className="bg-white border-b">
                <td className="px-6 py-4">{user.user_id}</td>
                <td className="px-6 py-4">{user.detail}</td>
                <td className="px-6 py-4">{user.salarie}</td>
                <td className="px-6 py-4">{user.date}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
