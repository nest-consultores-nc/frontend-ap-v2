import { useState, useMemo, useEffect } from 'react';
import { PaginationProjectsTable } from '../PaginationProjectsTable/PaginationProjectsTable';
import { Datum } from '../../interfaces/costeo/utilidad.interface';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

type SortKeys = keyof Datum;
type SortOrder = 'asc' | 'desc';

function getSortValue(item: Datum, key: SortKeys): string | number {
  if (key === 'date') {
    return new Date(item[key]).getTime();
  }
  return item[key];
}

export function TableResultUtilidad({ data }: { data: Datum[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKeys>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const projectsPerPage = 20;

  
  const [ufValue, setUfValue] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [totalProjectCost, setTotalProjectCost] = useState<number | null>(null);
  const [totalUtilidad, setTotalUtilidad] = useState<number | null>(null);


 
  const formatMM = (n: number | null) =>
    n === null ? '...' : n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  
  function DateBadge({
    date,
    variant = 'pill', 
  }: {
    date: string | Date;
    variant?: 'pill' | 'vertical';
  }) {
    const d = new Date(date);
    const day = d.toLocaleString('es-CL', { day: '2-digit' });
    const mon = d.toLocaleString('es-CL', { month: 'short' }).replace('.', '').toUpperCase();
    const year = d.toLocaleString('es-CL', { year: 'numeric' });

    if (variant === 'vertical') {
      return (
        <div className="shrink-0 rounded-xl bg-gray-100 text-gray-700 px-2 py-1 leading-none text-center">
          <div className="text-[10px] tracking-wide">{mon}</div>
          <div className="text-sm font-bold tabular-nums -mt-[1px]">{day}</div>
          <div className="text-[10px] opacity-70">{year.slice(-2)}</div>
        </div>
      );
    }

 
    return (
      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
        <span className="tabular-nums">{day}</span>&nbsp;
        <span>{mon}</span>&nbsp;
        <span className="opacity-70">{year}</span>
      </span>
    );
  }


  useEffect(() => {
    const fetchUFValue = async () => {
      try {
        const response = await fetch('https://mindicador.cl/api/uf');
        const data = await response.json();
        const ufToday = data.serie[0].valor;
        setUfValue(ufToday);
      } catch (error) {
        console.error('Error fetching UF:', error);
      }
    };
    fetchUFValue();
  }, []);


  useEffect(() => {
    if (ufValue && data.length > 0) {
      const totalAmount = data.reduce((acc, item) => acc + item.amount, 0);
      const totalProjectCost = data.reduce((acc, item) => acc + item.project_cost, 0);
      const totalUtilidad = data.reduce((acc, item) => acc + item.utilidad, 0);

      setTotalAmount(totalAmount * ufValue / 1_000_000);
      setTotalProjectCost(totalProjectCost * ufValue / 1_000_000); 
      setTotalUtilidad(totalUtilidad * ufValue / 1_000_000); 
    }
  }, [data, ufValue]); 

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
    
      <div className="mb-4 text-lg font-bold text-blue-900">
        {ufValue !== null
          ? `Valor actual de la UF: ${ufValue.toFixed(2)}`
          : 'Cargando valor de la UF...'}
      </div>

      <table className="text-sm text-left text-gray-500 w-full hidden sm:table">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 cursor-pointer w-1/12"
              onClick={() => handleSort('date')}
            >
              Fecha <SortIcon columnKey="date" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer w-1/6"
              onClick={() => handleSort('project_client')}
            >
              Cliente Proyecto <SortIcon columnKey="project_client" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer w-1/6"
              onClick={() => handleSort('amount')}
            >
           Ingresos (MM$) <SortIcon columnKey="amount" />
           <p className="text-indigo-500">
              {totalAmount !== null
            ? `Total Ingresos: ${totalAmount.toFixed(2)} MM$`
            : 'Calculando total de ingresos...'}
           </p>
            </th>
            <th
              className="px-6 py-3 cursor-pointer w-1/6"
              onClick={() => handleSort('project_cost')}
            >
              Costo Proyecto (MM$) <SortIcon columnKey="project_cost" />
          <p className="text-indigo-500">
          {totalProjectCost !== null
            ? `Total Costo Proyecto: ${totalProjectCost.toFixed(2)} MM$`
            : 'Calculando total de costos de proyecto...'}
          </p>
            </th>
            <th
              className="px-6 py-3 cursor-pointer w-1/6"
              onClick={() => handleSort('utilidad')}
            >
              Utilidad (MM$) <SortIcon columnKey="utilidad" />
            <p className="text-indigo-500">
            {totalUtilidad !== null
            ? `Total Utilidad: ${totalUtilidad.toFixed(2)} MM$`
            : 'Calculando total de utilidad...'}
            </p>
            </th>
          </tr>
        </thead>
        <tbody>
          {currentData.map(
            ({ date, project_client, amount, project_cost, utilidad }, index) => (
              <tr key={index} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  <DateBadge date={date} variant="pill" />
                </td>

                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {project_client || 'N/A'}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {ufValue !== null ? ((amount * ufValue) / 1_000_000).toFixed(2) : 'Cargando...'} 
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {ufValue !== null ? ((project_cost * ufValue) / 1_000_000).toFixed(2) : 'Cargando...'}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {ufValue !== null ? ((utilidad * ufValue) / 1_000_000).toFixed(2) : 'Cargando...'}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <div className="sm:hidden space-y-4 mt-2 text-left">
       
        <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-4">
          <div className="text-xs font-semibold text-gray-500 mb-1">Totales (MM$)</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ingresos:</span>
              <span className="font-semibold tabular-nums">{formatMM(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Costo Proyecto:</span>
              <span className="font-semibold tabular-nums">{formatMM(totalProjectCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Utilidad:</span>
              <span className={`font-semibold tabular-nums ${totalUtilidad && totalUtilidad < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatMM(totalUtilidad)}
              </span>
            </div>
          </div>
        </div>
      

   
        {currentData.map(({ date, project_client, amount, project_cost, utilidad }, index) => {
          <DateBadge date={date} variant="vertical" />

          return (
            <div key={index} className="bg-white border rounded-xl shadow p-4">
           
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 leading-5 line-clamp-2">
                  {project_client || 'N/A'}
                </h3>
                <DateBadge date={date} variant="vertical" />
              </div>


             
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ingresos (MM$)</span>
                  <span className="font-medium">
                    {ufValue !== null ? ((amount * ufValue) / 1_000_000).toFixed(2) : '...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Costo Proyecto (MM$)</span>
                  <span className="font-medium">
                    {ufValue !== null ? ((project_cost * ufValue) / 1_000_000).toFixed(2) : '...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Utilidad (MM$)</span>
                  <span className="font-medium">
                    {ufValue !== null ? ((utilidad * ufValue) / 1_000_000).toFixed(2) : '...'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <PaginationProjectsTable
        currentPage={currentPage}
        totalProjects={data.length}
        paginate={paginate}
        projectsPerPage={projectsPerPage}
      />
    </div>
  );
}
