import { useState, useMemo, useEffect } from 'react';
import { PaginationProjectsTable } from '../PaginationProjectsTable/PaginationProjectsTable';
import { Datum } from '../../interfaces/costeo/utilidad.interface';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

type SortKeys = keyof Datum;
type SortOrder = 'asc' | 'desc';

function getSortValue(item: Datum, key: SortKeys): string | number {
  if (key === 'date') {
    return String(item[key]);  
  }
  return item[key];
}

const formatCLP = (n: number | null) =>
  n === null
    ? '...'
    : Math.round(n).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function TableResultUtilidad({ data }: { data: Datum[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKeys>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterUtilidadThreshold, setFilterUtilidadThreshold] = useState<number>(0);
  const [isFilterActive, setIsFilterActive] = useState(false);
  
  const projectsPerPage = 20;

  
  const [ufValue, setUfValue] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [totalProjectCost, setTotalProjectCost] = useState<number | null>(null);
  const [totalUtilidad, setTotalUtilidad] = useState<number | null>(null);


 
  function DateBadge({ date, variant = 'pill' }: { date: string | Date; variant?: 'pill' | 'vertical' }) {
    const [y, m, dd] = String(date).split('-').map(Number);
    const d = new Date(y, m - 1, dd);
    const dayStr = d.toLocaleString('es-CL', { day: '2-digit' });
    const mon = d.toLocaleString('es-CL', { month: 'short' }).replace('.', '').toUpperCase();
    const yearStr = d.toLocaleString('es-CL', { year: 'numeric' });

    if (variant === 'vertical') {
      return (
        <div className="shrink-0 rounded-xl bg-gray-100 text-gray-700 px-2 py-1 leading-none text-center">
          <div className="text-[10px] tracking-wide">{mon}</div>
          <div className="text-sm font-bold tabular-nums -mt-[1px]">{dayStr}</div>
          <div className="text-[10px] opacity-70">{yearStr.slice(-2)}</div>
        </div>
      );
    }

    return (
      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
        <span className="tabular-nums">{dayStr}</span>&nbsp;
        <span>{mon}</span>&nbsp;
        <span className="opacity-70">{yearStr}</span>
      </span>
    );
  }


  const utilidadRange = useMemo(() => {
    if (!ufValue || data.length === 0) return { min: -50000000, max: 50000000 };
    
    const utilidades = data.map(item => item.utilidad * ufValue);
    const min = Math.floor(Math.min(...utilidades));
    const max = Math.ceil(Math.max(...utilidades));
    
    return { min, max };
  }, [data, ufValue]);


  useEffect(() => {
    if (!isFilterActive) {
      setFilterUtilidadThreshold(utilidadRange.min);
    }
  }, [utilidadRange, isFilterActive]);


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


  const sortedData = useMemo(() => {
    let filtered = [...data];

 
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.project_client.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterMonth) {
      filtered = filtered.filter(item => {
        const itemDateStr = String(item.date).slice(0, 7); 
        return itemDateStr === filterMonth;
      });
    }
 
 
    if (isFilterActive && ufValue) {
      filtered = filtered.filter(item => {
        const utilidadCLP = item.utilidad * ufValue;
        return utilidadCLP >= filterUtilidadThreshold;
      });
    }

    return filtered.sort((a, b) => {
      const aValue = getSortValue(a, sortKey);
      const bValue = getSortValue(b, sortKey);

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder, searchTerm, filterMonth, filterUtilidadThreshold, ufValue, isFilterActive]);


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMonth, isFilterActive, filterUtilidadThreshold]);

  useEffect(() => {
    if (ufValue && sortedData.length > 0) {
   
      const totalAmount = sortedData.reduce((acc, item) => acc + item.amount, 0);
      const totalProjectCost = sortedData.reduce((acc, item) => acc + item.project_cost, 0);
      const totalUtilidad = sortedData.reduce((acc, item) => acc + item.utilidad, 0);

      setTotalAmount(totalAmount * ufValue);
      setTotalProjectCost(totalProjectCost * ufValue); 
      setTotalUtilidad(totalUtilidad * ufValue); 
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Buscar cliente
            </label>
            <input
              type="text"
              placeholder="Ej: Nombre del cliente..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

     
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Filtrar por mes
            </label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setCurrentPage(1);
              }}
              onClick={(e) => {
                e.currentTarget.showPicker();
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </div>


        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-600">
              Filtrar proyectos con utilidad mínima de
            </label>
            <button
              onClick={() => {
                setIsFilterActive(!isFilterActive);
                if (isFilterActive) {
                  setFilterUtilidadThreshold(utilidadRange.min);
                }
              }}
              className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                isFilterActive
                  ? 'bg-[#CDEA80] text-[[#303031]] hover:bg-[#BDDEFF]'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {isFilterActive ? 'Activo' : 'Inactivo'}
            </button>
          </div>

          <div className="mb-2 text-sm text-gray-700 font-semibold">
            ${formatCLP(filterUtilidadThreshold)}
          </div>

          <div>
            <input
              type="range"
              min={utilidadRange.min}
              max={utilidadRange.max}
              step={Math.max(1, Math.floor((utilidadRange.max - utilidadRange.min) / 100))}
              value={filterUtilidadThreshold}
              onChange={(e) => {
                setFilterUtilidadThreshold(Number(e.target.value));
                setIsFilterActive(true);
                setCurrentPage(1);
              }}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#CDEA80]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>${formatCLP(utilidadRange.min)}</span>
              <span>${formatCLP(utilidadRange.max)}</span>
            </div>
          </div>
        </div>

          {(searchTerm || filterMonth || isFilterActive) && (
            <div className="mt-4 text-right">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterMonth('');
                  setIsFilterActive(false);
                  setFilterUtilidadThreshold(utilidadRange.min);
                  setCurrentPage(1);
                }}
                className="text-sm text-[#303031] hover:text-[#EDEBE5] font-medium"
              >
                Limpiar todos los filtros
              </button>
            </div>
          )}
      </div>

      <table className="text-sm text-left text-gray-500 w-full hidden lg:table">
        <thead className="text-[10px] lg:text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th
              className="px-3 py-3 cursor-pointer w-[12%]"
              onClick={() => handleSort('date')}
            >
              Fecha <SortIcon columnKey="date" />
            </th>
            <th
              className="px-3 py-3 cursor-pointer w-[25%]"
              onClick={() => handleSort('project_client')}
            >
              Cliente <SortIcon columnKey="project_client" />
            </th>
            <th
              className="px-3 py-3 cursor-pointer w-[21%]"
              onClick={() => handleSort('amount')}
            >
          Ingresos <SortIcon columnKey="amount" />
          <p className="text-indigo-500 font-normal normal-case text-[10px] lg:text-xs mt-1">
              {totalAmount !== null
            ? `Total: $${formatCLP(totalAmount)}`
            : 'Calculando...'}
          </p>
            </th>
            <th
              className="px-3 py-3 cursor-pointer w-[21%]"
              onClick={() => handleSort('project_cost')}
            >
              Costo Proyecto <SortIcon columnKey="project_cost" />
          <p className="text-indigo-500 font-normal normal-case text-[10px] lg:text-xs mt-1">
          {totalProjectCost !== null
            ? `Total: $${formatCLP(totalProjectCost)}`
            : 'Calculando...'}
          </p>
            </th>
            <th
              className="px-3 py-3 cursor-pointer w-[21%]"
              onClick={() => handleSort('utilidad')}
            >
              Utilidad <SortIcon columnKey="utilidad" />
            <p className="text-indigo-500 font-normal normal-case text-[10px] lg:text-xs mt-1">
            {totalUtilidad !== null
            ? `Total: $${formatCLP(totalUtilidad)}`
            : 'Calculando...'}
            </p>
            </th>
          </tr>
        </thead>
          <tbody>
            {currentData.map(
              ({ date, project_client, amount, project_cost, utilidad }, index) => (
                <tr key={index} className="white border-b">
                  <td className="px-3 py-3 font-medium text-gray-900">
                    <DateBadge date={date} variant="pill" />
                  </td>

                  <td className="px-3 py-3 font-medium text-gray-900 text-xs lg:text-sm">
                    <div className="line-clamp-2" title={project_client}>
                      {project_client || 'N/A'}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium text-gray-900 [#303031]space-nowrap text-xs lg:text-sm">
                    ${ufValue !== null ? formatCLP(amount * ufValue) : 'Cargando...'} 
                  </td>
                  <td className="px-3 py-3 font-medium text-gray-900 [#303031]space-nowrap text-xs lg:text-sm">
                    ${ufValue !== null ? formatCLP(project_cost * ufValue) : 'Cargando...'}
                  </td>
                  <td className={`px-3 py-3 font-medium [#303031]space-nowrap text-xs lg:text-sm ${
                    utilidad < 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    ${ufValue !== null ? formatCLP(utilidad * ufValue) : 'Cargando...'}
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
            <div className="flex justify-between">
              <span className="text-gray-600">Costo Proyecto:</span>
              <span className="font-semibold tabular-nums">${formatCLP(totalProjectCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Utilidad:</span>
              <span className={`font-semibold tabular-nums ${totalUtilidad && totalUtilidad < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ${formatCLP(totalUtilidad)}
              </span>
            </div>
          </div>
        </div>
   
        {currentData.map(({ date, project_client, amount, project_cost, utilidad }, index) => {
          <DateBadge date={date} variant="vertical" />

          return (
            <div key={index} className="white border rounded-xl shadow p-4">
           
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 leading-5 line-clamp-2">
                  {project_client || 'N/A'}
                </h3>
                <DateBadge date={date} variant="vertical" />
              </div>

            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ingresos</span>
                <span className="font-medium">
                  ${ufValue !== null ? formatCLP(amount * ufValue) : '...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Costo Proyecto</span>
                <span className="font-medium">
                  ${ufValue !== null ? formatCLP(project_cost * ufValue) : '...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Utilidad</span>
                <span className={`font-medium ${utilidad < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ${ufValue !== null ? formatCLP(utilidad * ufValue) : '...'}
                </span>
              </div>
            </div>             

            </div>
          );
        })}
      </div>

      <PaginationProjectsTable
        currentPage={currentPage}
        totalProjects={sortedData.length}
        paginate={paginate}
        projectsPerPage={projectsPerPage}
      />
    </div>
  );
}
