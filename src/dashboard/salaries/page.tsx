import { useEffect, useState, useMemo } from 'react';
import { IUserCSV, IUsers } from '../../interfaces/users/users.interface';
import { getAllUsers } from '../../api/users';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { getCurrentDate } from '../../functions/getCurrentDate';
import { ISalaries } from '../../interfaces/salaries/salaries.interface';
import {
  SubmitButtonsCsv,
  TableUploadSalaries,
  HeaderPages,
} from '../../components';
import { createSalarieQuery } from '../../api/salaries/post-salaries';
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect';
import Swal from 'sweetalert2'
import { TabsViewMode } from '../../components/TabsViewMode/TabsViewMode';

export default function SalariesPage() {
  const [ ,setLoading] = useState<boolean>(true);
  const [salaries, setSalaries] = useState<ISalaries[]>([]);
  const [users, setUsers] = useState<IUsers[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');


  const [viewMode, setViewMode] = useState<'form' | 'upload'>('form');
  const [formData, setFormData] = useState({
    user_id: '',
    detail: '',
    salarie: '',
    date: '',
  });

  const selectedUserName = useMemo(
    () => users.find(u => String(u.id) === selectedUser)?.name ?? '',
    [users, selectedUser]
  );


  const isFormValid =
    formData.detail && formData.salarie && formData.date && selectedUser;

  const navigate = useNavigate();

  useEffect(() => {
    checkTokenAndRedirect(navigate);
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    setFormData({
      ...formData,
      user_id: userId,
    });
  };

  const handleDownloadCSV = () => {
    const { currentDate } = getCurrentDate();

    const monthOptions: Intl.DateTimeFormatOptions = { month: 'short' };
    const formattedMonth = new Intl.DateTimeFormat('es-ES', monthOptions)
      .format(currentDate)
      .toLowerCase()
      .replace('.', '');

    const formattedYear = currentDate.getFullYear().toString().slice(-2);
    const formattedMonthYear = `${formattedMonth}-${formattedYear}`;

    const csvData = users.map(
      (user): IUserCSV => ({
        detail: user.name,
        salarie: null,
        user_id: user.id,
        date: user.date!,
      })
    );

    const csv = Papa.unparse(csvData);

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `sueldos-${formattedMonthYear}.csv`);
  };

 

  const handleSubmit = async () => {
    try {
      if (salaries.length === 0) return;

      const { isConfirmed } = await Swal.fire({
        title: '¿Registrar salarios desde CSV?',
        html: `
          <div style="text-align:left">
            Se guardarán <b>${salaries.length}</b> registros.
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3E3378',
        cancelButtonColor: '#d33',
      });
      if (!isConfirmed) return;

      const response = await createSalarieQuery(
        salaries,
        localStorage.getItem('token')!
      );

      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Registro Exitoso!',
          text: response.msg || 'Los salarios del CSV se guardaron correctamente',
          confirmButtonColor: '#3E3378',
        });
        setSalaries([]);
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.msg || 'Ha ocurrido un error al guardar los salarios del CSV',
          confirmButtonColor: '#d33',
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        text: 'Ha ocurrido al intentar agregar los salarios.',
        confirmButtonColor: '#d33',
      });
    }
  };



  const handleSubmitForm = async () => {
    try {
      const salaryData: ISalaries = {
        ...formData,
        user_id: Number(formData.user_id),
      };

      // Confirmación previa
      const { isConfirmed } = await Swal.fire({
        title: '¿Confirmar registro del salario?',
        html: `
          <div style="text-align:left">
            <b>Colaborador:</b> ${selectedUserName || '(sin seleccionar)'}<br/>
            <b>Detalle:</b> ${salaryData.detail || '(sin detalle)'}<br/>
            <b>Salario:</b> ${salaryData.salarie || '0'}<br/>
            <b>Fecha:</b> ${salaryData.date || '(sin fecha)'}
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3E3378',
        cancelButtonColor: '#d33',
      });
      if (!isConfirmed) return;

      const response = await createSalarieQuery(
        [salaryData],
        localStorage.getItem('token')!
      );

      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Registro Exitoso!',
          text: response.msg || 'El salario se guardó correctamente',
          confirmButtonColor: '#3E3378',
        });
        setFormData({ user_id: '', detail: '', salarie: '', date: '' });
        setSelectedUser('');
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.msg || 'Ha ocurrido un error al guardar el salario',
          confirmButtonColor: '#d33',
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        text: 'Ha ocurrido al intentar agregar el salario.',
        confirmButtonColor: '#d33',
      });
    }
  };


  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data: IUsers[] = await getAllUsers(
          `users-api/obtener-usuarios`,
          localStorage.getItem('token')!
        );
        setUsers(data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ha ocurrido un error al traer a los usuarios',
          confirmButtonColor: '#d33',
        });
      } finally {
        setLoading(false);
      }

    };

    fetchData();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const updatedData = result.data
            .map((row: any) => {
              if (row.user_id && row.salarie) {
                return {
                  user_id: row.user_id,
                  salarie: row.salarie,
                  detail: row.detail,
                  date: row.date,
                };
              } else {
                return null;
              }
            })
            .filter(Boolean);

            if (updatedData.length > 0) {
              setSalaries(updatedData as ISalaries[]);
            } else {
              Swal.fire({
                icon: 'warning',
                title: 'CSV inválido',
                text: 'Revisa el archivo. "user_id" y "salarie" son obligatorios.',
                confirmButtonColor: '#3E3378',
              });
            }

        },
        error: (error) => {
          console.error('Error reading CSV file:', error);
        },
      });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Formato no soportado',
          text: 'Por favor, sube un archivo con extensión .csv',
          confirmButtonColor: '#3E3378',
        });
      }

  };

  return (
    <div>
      
      <HeaderPages
        titlePage="Registrar Sueldos"
        subTitlePage={
          <>
            <span className="hidden lg:inline">
              Por favor, selecciona una opción para continuar.
            </span>
            <span className="inline lg:hidden">
              Por favor, completa cada campo solicitado para continuar.
            </span>
          </>
        }
      />

      <div className="hidden lg:block">
        <TabsViewMode
          active={viewMode}
          onChange={setViewMode}
          labels={{ form: 'Completar Formulario', upload: 'Subir Archivo' }}
        />
      </div>


      {viewMode === 'form' ? (
        <form>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Nombre del Colaborador
              </label>
              <select
                name="user_id"
                value={selectedUser}
                onChange={handleUserChange}
                className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 sm:text-sm sm:leading-6"
              >
                <option value="">Seleccione un usuario</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Ingrese el Detalle
              </label>
              <input
                type="text"
                name="detail"
                placeholder="Ej: Pago de sueldo correspondiente al mes de..."
                value={formData.detail}
                onChange={handleInputChange}
                className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Ingrese el Salario
              </label>
              <input
                type="number"
                name="salarie"
                placeholder="Ej: 500000 sin puntos"
                value={formData.salarie}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault()
                }}
                inputMode="numeric"
                className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Ingrese la Fecha
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="col-span-full flex justify-end">
              <button
                type="button"
                onClick={handleSubmitForm}
                disabled={!isFormValid}
                className={`mt-2 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition
                  ${!isFormValid
                    ? 'bg-indigo-600/60 text-white cursor-not-allowed'
                    : 'bg-[#3E3378] text-white hover:bg-[#89CCDC] hover:text-black'}
                `}
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      ) : (
  
 

        <form>
          <label className="block text-sm font-medium text-gray-900">
            Subir Archivo .csv
          </label>
          <div className="flex justify-between">
            <input
              id="file_input"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="block w-full text-sm p-2 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />

          </div>
          <div className="overflow-x-auto mt-4">
            <TableUploadSalaries salaries={salaries} />
          </div>
          <SubmitButtonsCsv
            handleDownloadCSV={handleDownloadCSV}
            handleSubmit={handleSubmit}
            hasData={salaries.length > 0}
          />
        </form>
      )}
    </div>
  );
}
