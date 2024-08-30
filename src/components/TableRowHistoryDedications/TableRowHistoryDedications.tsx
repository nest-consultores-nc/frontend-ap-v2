interface TableRowProps {
  projectName: string
  client: string
  dedication: string
  week: string
}

export function TableRowHistoryDedication({
  projectName,
  client,
  dedication,
  week,
}: TableRowProps): JSX.Element {
  return (
    <tr className="bg-white border-b">
      <td className="px-6 py-4 font-medium text-gray-900">{projectName}</td>
      <td className="px-6 py-4">{client}</td>
      <td className="px-6 py-4">{dedication}</td>
      <td className="px-6 py-4">{week}</td>
    </tr>
  )
}
