import { useState, useMemo, useEffect } from 'react';
import { PaginationProjectsTable } from '../PaginationProjectsTable/PaginationProjectsTable';
import { IDataIngresos } from '../../interfaces/costeo/ingresos.interface';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

type SortKeys = keyof IDataIngresos;
type SortOrder = 'asc' | 'desc';

function getSortValue(item: IDataIngresos, key: SortKeys): string | number {
  if (key === 'date') {
    return new Date(item[key]).getTime();
  }
  if (typeof item[key] === 'number') {
    return item[key] as number;
  }
  return (item[key] as string).toLowerCase();
}

const formatCLP = (n: number | null) =>
  n === null
    ? '...'
    : Math.round(n).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

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


export function TableResultIngresos({ data }: { data: IDataIngresos[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKeys>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTemporality, setFilterTemporality] = useState('');
  const [filterClient, setFilterClient] = useState('');

  const projectsPerPage = 10;
  const [ufValue, setUfValue] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);


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

  const uniqueTemporalities = useMemo(() => {
    const temps = data.map(item => item.temporalities_name).filter(Boolean);
    return Array.from(new Set(temps)).sort();
  }, [data]);

  const uniqueClients = useMemo(() => {
    const clients = data.map(item => item.project_client).filter(Boolean);
    return Array.from(new Set(clients)).sort();
  }, [data]);

  const sortedData = useMemo(() => {
    let filtered = [...data];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.detail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTemporality) {
      filtered = filtered.filter(item => item.temporalities_name === filterTemporality);
    }

    if (filterClient) {
      filtered = filtered.filter(item => item.project_client === filterClient);
    }

    return filtered.sort((a, b) => {
      const aValue = getSortValue(a, sortKey);
      const bValue = getSortValue(b, sortKey);

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder, searchTerm, filterTemporality, filterClient]);

  useEffect(() => {
    if (ufValue && sortedData.length > 0) { 
      const total = sortedData.reduce((acc, item) => acc + item.amount, 0);
      setTotalAmount(total * ufValue); 
    }
  }, [sortedData, ufValue]);

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
          ? `Valor actual de la UF: $${ufValue.toFixed(2)}`
          : 'Cargando valor de la UF...'}
      </div>

      <div className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Buscar por detalle
            </label>
            <input
              type="text"
              placeholder="Ej: Descripción del ingreso..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Filtrar por temporalidad
            </label>
            <select
              value={filterTemporality}
              onChange={(e) => {
                setFilterTemporality(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todas las temporalidades</option>
              {uniqueTemporalities.map((temp) => (
                <option key={temp} value={temp}>
                  {temp}
                </option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Filtrar por cliente
            </label>
            <select
              value={filterClient}
              onChange={(e) => {
                setFilterClient(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos los clientes</option>
              {uniqueClients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || filterTemporality || filterClient) && (
          <div className="mt-3 text-right">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterTemporality('');
                setFilterClient('');
                setCurrentPage(1);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <table className="text-sm text-left text-gray-500 w-full hidden lg:table">

        <thead className="text-[10px] lg:text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
              <th
                className="px-3 py-3 cursor-pointer w-[10%]"
                onClick={() => handleSort('date')}
              >
                Fecha <SortIcon columnKey="date" />
              </th>
              <th
                className="px-3 py-3 cursor-pointer w-[23%]"
                onClick={() => handleSort('detail')}
              >
                Detalle <SortIcon columnKey="detail" />
              </th>
              <th
                className="px-3 py-3 cursor-pointer w-[15%]"
                onClick={() => handleSort('temporalities_name')}
              >
                Temporalidad <SortIcon columnKey="temporalities_name" />
              </th>
              <th
                className="px-3 py-3 cursor-pointer w-[25%]"
                onClick={() => handleSort('project_client')}
              >
                Cliente <SortIcon columnKey="project_client" />
              </th>
              <th
                className="px-3 py-3 cursor-pointer w-[20%]"
                onClick={() => handleSort('amount')}
              >
              Ingresos <SortIcon columnKey="amount" />
              <p className="text-indigo-500 font-normal normal-case text-[10px] lg:text-xs mt-1">
              {totalAmount !== null
                ? `Total: $${formatCLP(totalAmount)}`
                : 'Calculando total...'}
              </p>
            </th>
          </tr>
        </thead>
        <tbody>
          {currentData.map(
            (
              {
                date,
                detail,
                temporalities_name,
                project_client,
                amount,
              },
              index
            ) => (
              <tr key={index} className="white border-b">
                  <td className="px-3 py-3 font-medium text-gray-900">
                    <DateBadge date={date} variant="pill" />
                  </td>

                  <td className="px-3 py-3 font-medium text-gray-900 text-xs lg:text-sm">
                    <div className="line-clamp-2" title={detail}>
                      {detail}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium text-gray-900 text-xs lg:text-sm">
                    {temporalities_name}
                  </td>
                  <td className="px-3 py-3 font-medium text-gray-900 text-xs lg:text-sm">
                    <div className="line-clamp-2" title={project_client}>
                      {project_client}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium text-gray-900 [#303031]space-nowrap text-xs lg:text-sm">
                    ${ufValue !== null ? formatCLP(amount * ufValue) : 'Cargando...'} 
                  </td>
              </tr>
            )
          )}
        </tbody>
      </table>


    <div className="lg:hidden space-y-4 mt-2 text-left">

      <div className="rounded-2xl white ring-1 ring-gray-200 shadow-sm p-4">
        <div className="text-xs font-semibold text-gray-500 mb-1">Totales (CLP)</div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Ingresos:</span>
            <span className="font-semibold tabular-nums">${formatCLP(totalAmount)}</span>
          </div>
        </div>
      </div>

      {currentData.map(({ date, detail, temporalities_name, project_client, amount }, index) => {
        return (
          <div key={index} className="white border rounded-xl shadow p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 leading-5 line-clamp-2">
                Projecto: {project_client || 'N/A'}
              </h3>
              <DateBadge date={date} variant="vertical" />
            </div>

            <div className="text-xs text-gray-500 mb-1">
              {temporalities_name ? `Temporalidad: ${temporalities_name}` : 'Sin temporalidad'}
            </div>
            <div className="text-xs text-gray-500">
              Detalle: {detail || 'Sin detalle'}
            </div>

            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ingresos</span>
                <span className="font-medium">
                  ${ufValue !== null ? formatCLP(amount * ufValue) : 'Cargando...'}
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
