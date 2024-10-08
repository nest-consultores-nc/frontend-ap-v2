'use client';

import { useState, useMemo } from 'react';
import { ICosteoMensual } from '../../interfaces/costeo/costeo-mensual.interface';
import { PaginationProjectsTable } from '../PaginationProjectsTable/PaginationProjectsTable';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

// Función para formatear la fecha a "yyyy-MM-dd"
const formatDateToISO = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Asegura dos dígitos para el mes
  const day = String(d.getDate()).padStart(2, '0'); // Asegura dos dígitos para el día
  return `${year}-${month}-${day}`; // Retorna solo la parte de la fecha
};

type SortKeys = keyof ICosteoMensual;
type SortOrder = 'asc' | 'desc';

function getSortValue(item: ICosteoMensual, key: SortKeys): string | number {
  if (key === 'date') {
    return new Date(item[key]).getTime();
  }
  if (typeof item[key] === 'number') {
    return item[key] as number;
  }
  return (item[key] as string).toLowerCase();
}

export function TableResultCosteoMensual({ data }: { data: ICosteoMensual[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKeys>('project_id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const projectsPerPage = 10;

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = getSortValue(a, sortKey);
      const bValue = getSortValue(b, sortKey);

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentData = sortedData.slice(indexOfFirstProject, indexOfLastProject);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSort = (key: SortKeys) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKeys }) => {
    if (columnKey !== sortKey) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="inline w-4 h-4 ml-1" />
    ) : (
      <ArrowDownIcon className="inline w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="overflow-x-auto mt-4">
      <table className="text-sm text-left text-gray-500 w-full">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('date')}
            >
              Fecha <SortIcon columnKey="date" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('project_client')}
            >
              Cliente Proyecto <SortIcon columnKey="project_client" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('salarie_cost')}
            >
              Costo Salario (MM$) <SortIcon columnKey="salarie_cost" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('direct_cost')}
            >
              Costo Directo (MM$) <SortIcon columnKey="direct_cost" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('indirect_cost')}
            >
              Costo Indirecto (MM$) <SortIcon columnKey="indirect_cost" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('project_cost')}
            >
              Costo Proyecto (MM$) <SortIcon columnKey="project_cost" />
            </th>
          </tr>
        </thead>
        <tbody>
          {currentData.map(
            ({
              project_id,
              salarie_cost,
              direct_cost,
              date,
              indirect_cost,
              project_cost,
              project_client,
            }) => (
              <tr key={project_id} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {date && formatDateToISO(date)} {/* Ajuste para mostrar solo la fecha */}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {project_client}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {(salarie_cost / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {(direct_cost / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {(indirect_cost / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {(project_cost / 100).toFixed(2)}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <PaginationProjectsTable
        currentPage={currentPage}
        totalProjects={data.length}
        paginate={paginate}
        projectsPerPage={projectsPerPage}
      />
    </div>
  );
}
