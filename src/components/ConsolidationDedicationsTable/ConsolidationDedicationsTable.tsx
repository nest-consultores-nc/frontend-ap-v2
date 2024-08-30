export function ConsolidationDedicationsTable() {
  return (
    <div className="border relative sm:rounded-lg my-4">
      <p className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
        Consolidación de horas
      </p>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">
              Nombre Proyecto
            </th>
            <th scope="col" className="px-6 py-3">
              Cliente
            </th>
            <th scope="col" className="px-6 py-3">
              Dedicación
            </th>
            <th scope="col" className="px-6 py-3">
              Semana
            </th>
          </tr>
        </thead>
        <tbody>
          <td className="px-6 py-4">22</td>
          <td className="px-6 py-4"> %</td>
          <td className="px-6 py-4"> %</td>
          <td className="px-6 py-4"> %</td>
        </tbody>
      </table>
    </div>
  )
}
