import { useState, useMemo, useEffect } from 'react';
import { ICosteoMensual } from '../../interfaces/costeo/costeo-mensual.interface';
import { PaginationProjectsTable } from '../PaginationProjectsTable/PaginationProjectsTable';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';


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
    

export function TableResultCosteoMensual({ data }: { data: ICosteoMensual[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKeys>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCostThreshold, setFilterCostThreshold] = useState<number>(0);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const projectsPerPage = 10;

  const [ufValue, setUfValue] = useState<number | null>(null);
  const [totalSalarieCost, setTotalSalarieCost] = useState<number | null>(null);
  const [totalDirectCost, setTotalDirectCost] = useState<number | null>(null);
  const [totalIndirectCost, setTotalIndirectCost] = useState<number | null>(null);
  const [totalProjectCost, setTotalProjectCost] = useState<number | null>(null);

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


  const costRange = useMemo(() => {
    if (!ufValue || data.length === 0) return { min: 0, max: 100000000 };
    
    const costs = data.map(item => item.project_cost * ufValue);
    const min = Math.floor(Math.min(...costs));
    const max = Math.ceil(Math.max(...costs));
    
    return { min, max };
  }, [data, ufValue]);


  useEffect(() => {
    if (!isFilterActive) {
      setFilterCostThreshold(costRange.min);
    }
  }, [costRange, isFilterActive]);

  const sortedData = useMemo(() => {
    let filtered = [...data];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.project_client.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }


    if (isFilterActive && ufValue) {
      filtered = filtered.filter(item => {
        const totalCostCLP = item.project_cost * ufValue;
        return totalCostCLP >= filterCostThreshold;
      });
    }


    return filtered.sort((a, b) => {
      const aValue = getSortValue(a, sortKey);
      const bValue = getSortValue(b, sortKey);

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder, searchTerm, filterCostThreshold, ufValue, isFilterActive]);


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, isFilterActive, filterCostThreshold]);
  
  useEffect(() => {
    if (ufValue && sortedData.length > 0) {
    
      const totalSalarieCost = sortedData.reduce((acc, item) => acc + item.salarie_cost, 0);
      const totalDirectCost = sortedData.reduce((acc, item) => acc + item.direct_cost, 0);
      const totalIndirectCost = sortedData.reduce((acc, item) => acc + item.indirect_cost, 0);
      const totalProjectCost = sortedData.reduce((acc, item) => acc + item.project_cost, 0);

      setTotalSalarieCost(totalSalarieCost * ufValue);
      setTotalDirectCost(totalDirectCost * ufValue);
      setTotalIndirectCost(totalIndirectCost * ufValue); 
      setTotalProjectCost(totalProjectCost * ufValue); 
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
          
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
            
 
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Buscar cliente o proyecto
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-600">
                  Filtrar proyectos con costo mínimo de
                </label>
                <button
                  onClick={() => {
                    setIsFilterActive(!isFilterActive);
                    if (isFilterActive) {
                      setFilterCostThreshold(costRange.min);
                    }
                  }}
                  className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                    isFilterActive
                      ? 'bg-[#CDEA80] text-[#303031] hover:bg-[#CDEA80]'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {isFilterActive ? 'Activo' : 'Inactivo'}
                </button>
              </div>

     
              <div className="mb-2 text-sm text-gray-700 font-semibold">
                ${formatCLP(filterCostThreshold)}
              </div>

         
              <div>
                <input
                  type="range"
                  min={costRange.min}
                  max={costRange.max}
                  step={Math.max(1, Math.floor((costRange.max - costRange.min) / 100))}
                  value={filterCostThreshold}
                  onChange={(e) => {
                    setFilterCostThreshold(Number(e.target.value));
                    setIsFilterActive(true);
                    setCurrentPage(1);
                  }}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#CDEA80]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>${formatCLP(costRange.min)}</span>
                  <span>${formatCLP(costRange.max)}</span>
                </div>
              </div>
            </div>
          </div>


          {(searchTerm || isFilterActive) && (
            <div className="mt-4 text-right">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setIsFilterActive(false);
                  setFilterCostThreshold(costRange.min);
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
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-3 cursor-pointer w-[10%]" onClick={() => handleSort('date')}>
              Fecha <SortIcon columnKey="date" />
            </th>
            <th className="px-4 py-3 cursor-pointer w-[18%]" onClick={() => handleSort('project_client')}>
              Cliente Proyecto <SortIcon columnKey="project_client" />
            </th>
            <th className="px-4 py-3 cursor-pointer w-[18%]" onClick={() => handleSort('salarie_cost')}>
              Costo Sueldo <SortIcon columnKey="salarie_cost" />
              <p className="text-indigo-500 font-normal normal-case text-xs">
              {totalSalarieCost !== null
                ? `Total: $${formatCLP(totalSalarieCost)}`
                : 'Calculando total...'}
              </p>
            </th>
            <th className="px-6 py-3 cursor-pointer w-1/5" onClick={() => handleSort('direct_cost')}>
              Costo Directo <SortIcon columnKey="direct_cost" />
              <p className="text-indigo-500 font-normal normal-case text-xs">
              {totalDirectCost !== null
                ? `Total: $${formatCLP(totalDirectCost)}`
                : 'Calculando total...'}
              </p>
            </th>
            <th className="px-6 py-3 cursor-pointer w-1/5" onClick={() => handleSort('indirect_cost')}>
              Costo Indirecto <SortIcon columnKey="indirect_cost" />
              <p className="text-indigo-500 font-normal normal-case text-xs">
              {totalIndirectCost !== null
                ? `Total: $${formatCLP(totalIndirectCost)}`
                : 'Calculando total...'}
              </p>
            </th>
            <th className="px-6 py-3 cursor-pointer w-1/5" onClick={() => handleSort('project_cost')}>
              Costo Proyecto <SortIcon columnKey="project_cost" />
              <p className="text-indigo-500 font-normal normal-case text-xs">
              {totalProjectCost !== null
                ? `Total: $${formatCLP(totalProjectCost)}`
                : 'Calculando total...'}
              </p>
            </th>
          </tr>
        </thead>
        <tbody>
          {currentData.map(
            ({ project_id, salarie_cost, direct_cost, date, indirect_cost, project_cost, project_client }) => (
              <tr key={project_id} className="white border-b">
                <td className="px-4 py-3 font-medium text-gray-900 [#303031]space-nowrap text-xs lg:text-sm">
                  <DateBadge date={date} variant="pill" />
                </td>

                <td className="px-4 py-3 font-medium text-gray-900 [#303031]space-nowrap text-xs lg:text-sm">
                  {project_client}
                </td>
                  <td className="px-4 py-3 font-medium text-gray-900 [#303031]space-nowrap text-xs lg:text-sm">
                    ${ufValue !== null ? formatCLP(salarie_cost * ufValue) : 'Cargando...'} 
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 [#303031]space-nowrap text-xs lg:text-sm">
                    ${ufValue !== null ? formatCLP(direct_cost * ufValue) : 'Cargando...'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 [#303031]space-nowrap text-xs lg:text-sm">
                    ${ufValue !== null ? formatCLP(indirect_cost * ufValue) : 'Cargando...'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 [#303031]space-nowrap text-xs lg:text-sm">
                    ${ufValue !== null ? formatCLP(project_cost * ufValue) : 'Cargando...'}
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
              <span className="text-gray-600">Costo Sueldo:</span>
              <span className="font-semibold tabular-nums">${formatCLP(totalSalarieCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Costo Directo:</span>
              <span className="font-semibold tabular-nums">${formatCLP(totalDirectCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Costo Indirecto:</span>
              <span className="font-semibold tabular-nums">${formatCLP(totalIndirectCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Costo Proyecto:</span>
              <span className="font-semibold tabular-nums">${formatCLP(totalProjectCost)}</span>
            </div>
          </div>
        </div>

        {currentData.map(({ project_id, salarie_cost, direct_cost, date, indirect_cost, project_cost, project_client }) => {
          return (
            <div key={project_id} className="white border rounded-xl shadow p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 leading-5 line-clamp-2">
                  {project_client || 'N/A'}
                </h3>
                <DateBadge date={date} variant="vertical" />
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Costo Sueldo</span>
                  <span className="font-medium">
                    ${ufValue !== null ? formatCLP(salarie_cost * ufValue) : 'Cargando...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Costo Directo</span>
                  <span className="font-medium">
                    ${ufValue !== null ? formatCLP(direct_cost * ufValue) : 'Cargando...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Costo Indirecto</span>
                  <span className="font-medium">
                    ${ufValue !== null ? formatCLP(indirect_cost * ufValue) : 'Cargando...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Costo Proyecto</span>
                  <span className="font-medium">
                    ${ufValue !== null ? formatCLP(project_cost * ufValue) : 'Cargando...'}
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
