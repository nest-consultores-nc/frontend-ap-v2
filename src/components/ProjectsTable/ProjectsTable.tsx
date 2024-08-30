import { formatDateTime } from '../../functions/formatDateTime'
import { IProject } from '../../interfaces/projects/projects.interface'

export function ProjectsTable({ projects }: { projects: IProject[] }) {
  const getStatusClass = (status: string) => {
    return status == 'Vigente' ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="overflow-x-auto mt-4">
      <table className="text-sm text-left text-gray-500 w-full">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">Nombre del Proyecto</th>
            <th className="px-6 py-3">Nombre del Cliente</th>
            <th className="px-6 py-3">Categoría del Proyecto</th>
            <th className="px-6 py-3">Tipo de Proyecto</th>
            <th className="px-6 py-3">Estado del Proyecto</th>
            <th className="px-6 py-3">Fecha de Creación</th>
            <th className="px-6 py-3">
              <span className="sr-only">Editar</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map(
            ({
              id,
              project_name,
              client,
              category,
              type,
              project_status,
              createdAt,
            }) => (
              <tr key={id} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {project_name}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {client?.clientName || 'N/A'}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {category?.categoryName || 'N/A'}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {type?.typeName || 'N/A'}
                </td>
                <td
                  className={`${getStatusClass(
                    project_status
                  )} px-6 py-4 font-medium whitespace-nowrap`}
                >
                  {project_status || 'N/A'}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {formatDateTime(createdAt)}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  )
}
