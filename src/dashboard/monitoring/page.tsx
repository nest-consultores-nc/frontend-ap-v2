import { useEffect, useState } from 'react'
import { IDedicationsByMonth } from '../../interfaces/dedications/dedications.interfaces'
import { getAllUsersDedicationByMonth } from '../../api/dedications'
import { useNavigate } from 'react-router-dom'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'
import { getDedicationByNameQuery } from '../../api/dashboards'

export default function MonitoringPage() {
  
  const[openUser, setOpenUser] = useState<string | null>(null);

  const toggleUser = (user: string) => {
    setOpenUser(openUser === user ? null : user);
  };
  
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [dedications, setDedications] = useState<IDedicationsByMonth[]>([])

  const [dashboardUrl, setDashboardUrl] = useState<string>('')
  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

    
  const formatPercent = (val: number | string | undefined | null) => {
    if (val === undefined || val === null) return '—';
    const n = typeof val === 'number' ? val : Number(val);
    if (!Number.isFinite(n)) return '—';
    
    return `${Math.round(n * 100)} %`;
  };

 
  const parseToUTCDate = (val: unknown): Date | null => {
    if (val == null) return null;

   
    if (val instanceof Date && !isNaN(val.getTime())) return val;

    
    if (typeof val === 'number' || (typeof val === 'string' && /^\d+$/.test(val))) {
      const num = Number(val);
      const d = new Date(num);
      return isNaN(d.getTime()) ? null : d;
    }

    if (typeof val === 'string') {
      const s = val.trim();

     
      const m1 = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
      if (m1) {
        const [, dd, mm, yyyy] = m1;
        const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
        return isNaN(d.getTime()) ? null : d;
      }

     
      const m2 = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
      if (m2) {
        const [, yyyy, mm, dd] = m2;
        const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
        return isNaN(d.getTime()) ? null : d;
      }

      
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d;
    }

    return null;
  };

  const formatDDMMYYYY = (d: Date): string => {
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

   
  const formatWeek = (week: unknown) => {
    const d = parseToUTCDate(week);
    if (!d) return '—';
    
    d.setUTCDate(d.getUTCDate() - 1);
    return formatDDMMYYYY(d);
  };



  useEffect(() => {
    const getDashboardByName = async () => {
      try {
        setLoading(true)
        const data = await getDedicationByNameQuery(
          'dashboards-api/get-dashboard/monitoreo',
          localStorage.getItem('token')!
        )

        if (data && data.url) {
          setDashboardUrl(data.url)
        }
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }

    getDashboardByName()
  }, [])

  useEffect(() => {
    const updateDedication = async () => {
      try {
        setLoading(true)
        const data = await getAllUsersDedicationByMonth(
          '/dedicacion-api/dedicaciones-por-mes',
          localStorage.getItem('token')!
        )

        setDedications(data)
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }

    updateDedication()
  }, [])

  return (
    <div className="flex w-full justify-center flex-col mt-12 md:mt-0">
      <iframe
        src={dashboardUrl}
        className="w-full h-[400px] md:h-[600px] lg:h-[800px]"
        title="Reporte Agencia Polux"
        allowFullScreen={true}
      ></iframe>


      {loading ? (
        <p>Cargando...</p>
      ) : (
        dedications.map((dedication) => (
          <div key={dedication.user} className="border relative sm:rounded-lg my-4 rounded-md overflow-hidden">

             
            <button
              className="w-full px-6 py-4 font-medium text-gray-900 bg-[#CDEA80] border-[#BDDEFF] text-left focus:outline-none hover:bg-[#BDDEFF] hover:text-[#303031] transition-colors"
              onClick={() => toggleUser(dedication.user)}
            >
              {dedication.user}
            </button>


      
            {openUser === dedication.user && (
              <>
         
                <table className="hidden sm:table w-full text-sm text-left border border-[#EDEBE5] rounded-md shadow">
                  <thead className="text-xs text-[[#303031]] uppercase bg-[#EDEBE5]">
                    <tr>
                      <th scope="col" className="px-6 py-3">Nombre Proyecto</th>
                      <th scope="col" className="px-6 py-3">Cliente</th>
                      <th scope="col" className="px-6 py-3">Dedicación</th>
                      <th scope="col" className="px-6 py-3">Semana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dedication.dedications.map((project) => (
                      <tr key={project.id} className="border-t border-[#303031] hover:bg-[#EDEBE5] transition-colors">
                        <td className="px-6 py-4 font-medium">{project.project_name}</td>
                        <td className="px-6 py-4">{project.client_name}</td>
                        <td className="px-6 py-4">
                          {Number(project.dedicated * 100).toFixed(0)} %
                        </td>
                        <td className="px-6 py-4">{formatWeek(project.week)}</td>

                      </tr>
                    ))}
                  </tbody>
                </table>

            
             
                <div className="sm:hidden px-4 pb-4 space-y-3 mt-4">
                  {dedication.dedications.map((project, index) => (
                    <div
                      key={project.id ?? index}
                      className="rounded-lg border border-gray-200 p-4 shadow-sm"
                    >
               
                      <div className="text-xs text-gray-500 mb-1">Semana</div>
                      <div className="text-base font-semibold text-gray-900 mb-3">
                        {formatWeek(project.week)}
                      </div>

        
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <div className="text-xs text-gray-500">Proyecto</div>
                          <div className="text-sm text-gray-900 break-words">
                            {project.project_name}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Cliente</div>
                          <div className="text-sm text-gray-900 break-words">
                            {project.client_name}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Dedicación</div>
                          <div className="text-sm text-gray-900">
                            {formatPercent(project.dedicated)}
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>

              </>
            )}

          </div>
        ))
      )}
    </div>
  );
}