import { useEffect, useState, useMemo, useCallback } from 'react';
import {HeaderPages, LoadingSpinner } from '../../components';
import Papa from 'papaparse';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect';
import {
  getAllOutlayData,
  getOutlayCategoriesQuery,
} from '../../api/outlay/get-outlay';
import { useAuthStore } from '../../store';
import {
  IOutlayCategoryDetail,
  IOutlayData,
  IOutlayTemporality,
  IOutlayType,
} from '../../interfaces/outlay/outlay.interface';
import { formatedNumber } from '../../functions/formatedCLPNumber';
import dayjs from 'dayjs';
import { getAllProjects } from '../../api/projects/get-projects';
import { IProject } from '../../interfaces/projects/projects.interface';
import { createOutlayQuery } from '../../api/outlay/post-outlay';
import { sanitizeAmount } from '../../functions/sanitizeAmount';


export default function OutlayPage() {
  const { id, email } = useAuthStore();
  const [viewMode] = useState<'form' | 'upload'>('form'); 

  const [outlayData, setOutlayData] = useState<IOutlayData>({
    typeId: '',
    projectOrCategoryId: '',
    amount: '',
    detail: '',
    date: dayjs().format('YYYY-MM-DD'),
    temporalityId: '',
    isProject: true,
  });
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [outlayCategories, setOutlayCategories] =
    useState<IOutlayCategoryDetail[]>();
  const [outlayTypes, setOutlayTypes] = useState<IOutlayType[]>();
  const [temporalities, setTemporalities] = useState<IOutlayTemporality[]>();
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [fileData, setFileData] = useState<IOutlayData[]>([]);

 
  const TYPE = {
    POLUX: 1,
    RECURRENT: 2,
    NON_RECURRENT: 3,
    ACTIVITIES: 4,
  } as const;

  
  type ProjectWithType = IProject & {
    project_type_id?: number | null;
    type_id?: number | null;
    project_category_id?: number | null;
    project_client_id?: number | null;   
    project_or_activity?: string | null;
    active?: boolean | string | number | null;
  };

  const isActivity = useCallback((p: ProjectWithType) => {
    const tag = (p.project_or_activity ?? '').toString().trim().toLowerCase();

    const typeId   = Number(p.project_type_id ?? p.type_id ?? NaN);
    const catId    = Number(p.project_category_id ?? NaN);
    const clientId = Number(p.project_client_id ?? NaN);

   
    if (tag === 'actividad' || tag === 'actividades' || tag === 'activity') return true;

 
    if (typeId === TYPE.ACTIVITIES || catId === TYPE.ACTIVITIES) return true;

    
    if (clientId === 2) return true;

    return false;
  }, []);


  const getTypeId = (p: ProjectWithType): number =>
    Number(p.project_type_id ?? p.type_id ?? NaN);

  const isRecurrent = useCallback((p: ProjectWithType) => getTypeId(p) === TYPE.RECURRENT, [getTypeId, TYPE.RECURRENT]);
  const isNonRecurrent = useCallback((p: ProjectWithType) => getTypeId(p) === TYPE.NON_RECURRENT, [getTypeId, TYPE.NON_RECURRENT]);
  const isPolux = useCallback((p: ProjectWithType) => getTypeId(p) === TYPE.POLUX, [getTypeId, TYPE.POLUX]);


 
  const isActive = (p: ProjectWithType): boolean => {
    const v = p.active;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v === 1;
    if (typeof v === 'string') return v.trim().toLowerCase() === 'true';
    return false;
  };


  const filteredProjects = useMemo(() => {
    return projects.filter((p) =>
      showActiveOnly ? isActive(p as ProjectWithType) : !isActive(p as ProjectWithType)
    );
  }, [projects, showActiveOnly]);

 
  const cmp = (a: string, b: string) =>
    a.localeCompare(b, 'es', { sensitivity: 'base', ignorePunctuation: true });

  const getProjectLabel = (p: IProject) =>
    p.client?.clientName ? `${p.client.clientName} - ${p.project_name}` : p.project_name;


  
  const poluxProjects = useMemo(
    () => filteredProjects.filter((p) => isPolux(p as ProjectWithType)),
    [filteredProjects, isPolux]
  );
  const recurrentProjects = useMemo(
    () => filteredProjects.filter((p) => !isActivity(p as ProjectWithType) && isRecurrent(p as ProjectWithType)),
    [filteredProjects, isActivity, isRecurrent]
  );
  const nonRecurrentProjects = useMemo(
    () => filteredProjects.filter((p) => !isActivity(p as ProjectWithType) && isNonRecurrent(p as ProjectWithType)),
    [filteredProjects, isActivity, isNonRecurrent]
  );
  const activityProjects = useMemo(
    () => filteredProjects.filter((p) => isActivity(p as ProjectWithType)),
    [filteredProjects, isActivity]
  );

  
  const poluxSorted = useMemo(
    () => [...poluxProjects].sort((a, b) => cmp(getProjectLabel(a), getProjectLabel(b))),
    [poluxProjects]
  );
  const recurrentSorted = useMemo(
    () => [...recurrentProjects].sort((a, b) => cmp(getProjectLabel(a), getProjectLabel(b))),
    [recurrentProjects]
  );
  const nonRecurrentSorted = useMemo(
    () => [...nonRecurrentProjects].sort((a, b) => cmp(getProjectLabel(a), getProjectLabel(b))),
    [nonRecurrentProjects]
  );
  const activitySorted = useMemo(
    () => [...activityProjects].sort((a, b) => cmp(getProjectLabel(a), getProjectLabel(b))),
    [activityProjects]
  );


  const sortedCategories = useMemo(
    () => [...(outlayCategories ?? [])].sort((a, b) => cmp(a.name ?? '', b.name ?? '')),
    [outlayCategories]
  );



  const navigate = useNavigate();

  useEffect(() => {
    checkTokenAndRedirect(navigate);
  }, [navigate]);

  useEffect(() => {  
    const fetchOutlayData = async () => {
      try {
        const userId = id || localStorage.getItem('id')!;
        const userEmail = email || localStorage.getItem('email')!;
        const response = await getAllOutlayData(localStorage.getItem('token')!, userId, userEmail);
        setOutlayTypes(response.outlayTypes);
        setTemporalities(response.outlayTemporalities);
      } catch (error) {
        console.error('Error fetching outlay data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOutlayData();
  }, [id, email]);

  useEffect(() => {
    const fetchProjects = async () => { 
      try {
        const data = await getAllProjects(localStorage.getItem('token')!, false);
        setProjects(data?.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchOutlayCategories = async () => {
      try {
        const response = await getOutlayCategoriesQuery(localStorage.getItem('token')!);
        setOutlayCategories(response.outlayCategories);
      } catch (error) {
        console.error('Error fetching outlay categories:', error);
      }
    };
    fetchOutlayCategories();
  }, []);

  const handleChange = (field: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = event.target.value;

    if (field === 'amount') {
      value = value.replace(/[^0-9.-]/g, '').replace(/^-{2,}/g, '-');
      const isNegative = value.startsWith('-');
      value = formatedNumber(value.replace(/[^0-9]/g, ''));
      value = isNegative ? `-${value}` : value;
    }

    setOutlayData((prev) => {
    
      if (field === 'typeId') {
        const isProject = value === '1';
        return {
          ...prev,
          typeId: value,
          isProject,
         
          projectOrCategoryId: '',
        };
      }
      return { ...prev, [field]: value };
    });
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

     
    const missing: string[] = [];
    if (!outlayData.typeId) missing.push('Tipo de desembolso');
    if (!outlayData.projectOrCategoryId) missing.push('Categoría/Proyecto');
    if (!outlayData.amount || !sanitizeAmount(outlayData.amount)) missing.push('Monto');
    if (!outlayData.detail.trim()) missing.push('Detalle');
    if (!outlayData.date) missing.push('Fecha');
    if (!outlayData.temporalityId) missing.push('Temporalidad');

    if (missing.length > 0) {
      await Swal.fire({
        title: 'Faltan datos obligatorios',
        html: `
          <div style="text-align:left">
            Debes completar:
            <ul style="margin-top:8px; padding-left:18px;">
              ${missing.map(m => `<li>${m}</li>`).join('')}
            </ul>
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#4f46e5',
      });
      return;
    }

 
    const typeName = outlayTypes?.find(t => String(t.id) === String(outlayData.typeId))?.name || '(sin tipo)';
    const temporalityName = temporalities?.find(t => String(t.id) === String(outlayData.temporalityId))?.name || '(sin temporalidad)';
    const projectName = projects.find(p => String(p.id) === String(outlayData.projectOrCategoryId))
      ? `${projects.find(p => String(p.id) === String(outlayData.projectOrCategoryId))!.client.clientName} - ${projects.find(p => String(p.id) === String(outlayData.projectOrCategoryId))!.project_name}`
      : null;
    const categoryName = outlayCategories?.find(c => String(c.id) === String(outlayData.projectOrCategoryId))?.name || null;
    const targetName = outlayData.typeId === '1' ? (projectName || '(sin proyecto)') : (categoryName || '(sin categoría)');

    const { isConfirmed } = await Swal.fire({
      title: '¿Registrar este desembolso?',
      html: `
        <div style="text-align:left">
          <b>Tipo:</b> ${typeName}<br/>
          <b>${outlayData.typeId === '1' ? 'Proyecto' : 'Categoría'}:</b> ${targetName}<br/>
          <b>Monto:</b> ${outlayData.amount}<br/>
          <b>Detalle:</b> ${outlayData.detail || '(sin detalle)'}<br/>
          <b>Fecha:</b> ${dayjs(outlayData.date).format('YYYY-MM-DD')}<br/>
          <b>Temporalidad:</b> ${temporalityName}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'No, volver',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });
    if (!isConfirmed) return;

     
    const payload: IOutlayData = {
      ...outlayData,
      amount: sanitizeAmount(outlayData.amount), 
    };

    try {
      const response = await createOutlayQuery(localStorage.getItem('token')!, payload);

      if (response.status === 200) {
        await Swal.fire({
          title: '¡Registro exitoso!',
          text: response.msg || 'El desembolso fue registrado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6',
        });

        setOutlayData({
          typeId: '',
          projectOrCategoryId: '',
          amount: '',
          detail: '',
          date: dayjs().format('YYYY-MM-DD'),
          temporalityId: '',
          isProject: true,
        });
      } else {
        await Swal.fire({
          title: 'Error',
          text: response.msg || 'Ha ocurrido un error al registrar el desembolso.',
          icon: 'error',
        });
      }
    } catch (e) {
      console.error(e);
      await Swal.fire({
        title: 'Error',
        text: 'Ha ocurrido un error inesperado al registrar el desembolso.',
        icon: 'error',
      });
    }
  };


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const rows = (result.data as IOutlayData[]) || [];
        setFileData(rows);

        await Swal.fire({
          title: 'Archivo leído',
          html: `
            <div style="text-align:left">
              Se cargaron <b>${rows.length}</b> filas desde <b>${file.name}</b>.
            </div>
          `,
          icon: 'info',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#4f46e5',
        });
      },
      error: async (error) => {
        console.error('Error parsing file:', error);
        await Swal.fire({
          title: 'Error al leer el archivo',
          text: String(error),
          icon: 'error',
        });
      },
    });
  };


 

  return (
    <div>

      <HeaderPages
        titlePage="Ingresar Desembolso"
        subTitlePage="Completa cada campo solicitado para continuar."
      />

        {/* 
  <button
    onClick={() => toggleView('upload')}
    className={`py-2 px-4 text-white rounded-lg font-bold ${
      viewMode === 'upload' ? 'bg-indigo-600' : 'bg-gray-400'
    }`}
  >
    Subir Archivo
  </button> 
  */}
  
      {viewMode === 'form' && (
        <form onSubmit={handleSubmit}>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Seleccionar Tipo de Desembolso
              </label>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <select
                  onChange={(event) => handleChange('typeId', event)}
                  value={outlayData.typeId}
                  className="outline-none mt-2 block w-full rounded-md border px-1 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400"
                >
                  <option value="" disabled>
                    Seleccione una opción
                  </option>
                  {outlayTypes?.map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="col-span-full">
                  {outlayData.typeId === '1' && (
                    <div className="mb-2 flex items-center justify-start gap-3">
                      <span className="text-xs text-gray-600">Mostrando por Estado:</span>
                      <span className="text-xs text-gray-600">Inactivos</span>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={showActiveOnly}
                        onClick={() => setShowActiveOnly(v => !v)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200
                          ${showActiveOnly ? 'bg-indigo-600' : 'bg-gray-300'}`}
                        title={showActiveOnly ? 'Mostrando Activos' : 'Mostrando Inactivos'}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200
                            ${showActiveOnly ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>

                      <span className="text-xs text-gray-600">Activos</span>
                    </div>
                  )}




              <label className="block text-sm font-medium leading-6 text-gray-900">
                Seleccionar la Categoría o Proyecto
              </label>
              {loading ? (
                <LoadingSpinner />
              ) : (
                
                <select
                  onChange={(event) => handleChange('projectOrCategoryId', event)}
                  value={outlayData.projectOrCategoryId}
                  className="outline-none mt-2 block w-full rounded-md border px-1 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400"
                >
                  <option value="" disabled>
                    Seleccione una opción
                  </option>

                        {outlayData.typeId === '1' ? (
                          <>
                            <option disabled className="text-gray-400 font-semibold">── Recurrente ──</option>
                            {recurrentSorted.map((p) => (
                              <option key={p.id} value={p.id}>
                                {getProjectLabel(p)}
                              </option>
                            ))}

                            <option disabled className="text-gray-400 font-semibold">── Proyecto Pólux ──</option>
                            {poluxSorted.map((p) => (
                              <option key={p.id} value={p.id}>
                                {getProjectLabel(p)}
                              </option>
                            ))}

                            <option disabled className="text-gray-400 font-semibold">── No recurrente ──</option>
                            {nonRecurrentSorted.map((p) => (
                              <option key={p.id} value={p.id}>
                                {getProjectLabel(p)}
                              </option>
                            ))}

                            <option disabled className="text-gray-400 font-semibold">── Actividades ──</option>
                            {activitySorted.map((p) => (
                              <option key={p.id} value={p.id}>
                         
                                {p.client?.clientName ? getProjectLabel(p) : `Actividad - ${p.project_name}`}
                              </option>
                            ))}
                          </>
                        ) : (
                          sortedCategories.map(({ id, name }) => (
                            <option key={id} value={id}>{name}</option>
                          ))
                        )}


                </select>

              )}
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Ingrese el Monto
              </label>
              <input
                type="text"
                name="amount"
                value={outlayData.amount}
                onChange={(event) => handleChange('amount', event)}
                className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400"
                placeholder="$150.000"
              />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Ingrese el Detalle
              </label>
              <input
                type="text"
                name="detail"
                value={outlayData.detail}
                onChange={(event) => handleChange('detail', event)}
                className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400"
                placeholder="Describe el detalle brevemente"
              />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Ingrese la Fecha
              </label>
              <input
                type="date"
                name="date"
                value={outlayData.date}
                onChange={(event) => handleChange('date', event)}
                className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400"
              />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Seleccionar la Temporalidad
              </label>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <select
                  onChange={(event) => handleChange('temporalityId', event)}
                  value={outlayData.temporalityId}
                  className="outline-none mt-2 block w-full rounded-md border px-1 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400"
                >
                  <option value="" disabled>
                    Seleccione una temporalidad
                  </option>
                  {temporalities?.map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="submit"
              className="rounded-md bg-[#3E3378] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#89CCDC] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Guardar
            </button>
          </div>
        </form>
      )}
      {viewMode === 'upload' && (
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Subir Archivo .csv
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="block w-full text-sm p-2 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />
          <div className="overflow-x-auto mt-4">
            <table className="text-sm text-left text-gray-500 w-full">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Tipo de Desembolso</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3">Monto</th>
                  <th className="px-6 py-3">Detalle</th>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Temporalidad</th>
                </tr>
              </thead>
              <tbody>
                {fileData.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-6 py-4">{row.typeId}</td>
                    <td className="px-6 py-4">{row.projectOrCategoryId}</td>
                    <td className="px-6 py-4">{row.amount}</td>
                    <td className="px-6 py-4">{row.detail}</td>
                    <td className="px-6 py-4">{row.date}</td>
                    <td className="px-6 py-4">{row.temporalityId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              
              className="bg-indigo-600 font-bold text-white px-4 py-2 rounded"
            >
              Descargar Formato
            </button>
            <button className="bg-gray-400 font-bold text-white px-4 py-2 rounded">
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
