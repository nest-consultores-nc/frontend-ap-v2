import { useEffect, useState, useMemo } from 'react';
import { IUserCSV, IUsers } from '../../interfaces/users/users.interface';
import { getAllUsers } from '../../api/users';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
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
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function makeMonthList(start: Dayjs = dayjs(), count = 15) {
  const anchor = start.startOf('month');
  return Array.from({ length: count }, (_, i) => {
    const d = anchor.add(i, 'month');
    const abbr = MONTHS_ES[d.month()];
    const yy = d.format('YY');
    return { name: `${abbr}-${yy}` };
  });
}

export default function SalariesPage() {

  const [ ,setLoading] = useState<boolean>(true);
  const [salaries, setSalaries] = useState<ISalaries[]>([]);
  const [users, setUsers] = useState<IUsers[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [fileSelected, setFileSelected] = useState<boolean>(false);  


  const [viewMode, setViewMode] = useState<'form' | 'upload'>('form');
  const [csvMonth, setCsvMonth] = useState<string>('');
  const [monthAnchor] = useState(dayjs().startOf('month'));

  const monthFormatted = useMemo(
    () => makeMonthList(monthAnchor, 15),
    [monthAnchor]
  );

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

    useEffect(() => {
      if (!csvMonth && monthFormatted.length > 0) {
        setCsvMonth(monthFormatted[0].name);
      }
    }, [monthFormatted]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const parseMonthString = (monthStr: string | undefined | null) => {
    if (!monthStr || typeof monthStr !== 'string') return null;
    const parts = monthStr.trim().toLowerCase().split('-');
    if (parts.length !== 2) return null;
    const [abbr, yy] = parts;
    const monthIndex = MONTHS_ES.findIndex(m => m === abbr);
    if (monthIndex === -1) return null;
    const yearNum = Number(yy);
    if (Number.isNaN(yearNum)) return null;
    const year = 2000 + yearNum;
    return { year, monthIndex };
  };

  const firstDayFromMonthString = (
    monthStr: string | undefined | null,
    outputFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' = 'DD/MM/YYYY'
  ) => {
    const parsed = parseMonthString(monthStr);
    if (!parsed) return null;
    const { year, monthIndex } = parsed;
    const d = dayjs(new Date(year, monthIndex, 1));
    return outputFormat === 'DD/MM/YYYY' ? d.format('DD/MM/YYYY') : d.format('YYYY-MM-DD');
  };

  const handleDownloadCSV = () => {
    if (!Array.isArray(users)) {
      console.error('users is not an array');
      return;
    }
    const selectedMonth = csvMonth || `${MONTHS_ES[dayjs().month()]}-${dayjs().format('YY')}`;

    
    const firstDayForCsv = firstDayFromMonthString(selectedMonth, 'YYYY-MM-DD') || dayjs().startOf('month').format('YYYY-MM-DD');

    const csvData = users.map(
      (user): IUserCSV => ({
        detail: user.name,
        salarie: null,
        user_id: user.id,
        date: firstDayForCsv,
      })
    );

    const csv = Papa.unparse(csvData);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `sueldos-${selectedMonth}.csv`);
  };

 

  const handleSubmit = async () => {
    try {
      if (salaries.length === 0) return;

      const { isConfirmed } = await Swal.fire({
        title: '¿Registrar sueldo desde CSV?',
        html: `
          <div style="text-align:left">
            Se guardarán <b>${salaries.length}</b> registros.
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#CDEA80',
        cancelButtonColor: '#FF735C',
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
          text: response.msg || 'Los sueldos del CSV se guardaron correctamente',
          confirmButtonColor: '#CDEA80',
        });
        setSalaries([]);
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.msg || 'Ha ocurrido un error al guardar los sueldos del CSV',
          confirmButtonColor: '#FF735C',
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        text: 'Ha ocurrido al intentar agregar los sueldos.',
        confirmButtonColor: '#FF735C',
      });
    }
  };



  const handleSubmitForm = async () => {
    try {
      const salaryData: ISalaries = {
        ...formData,
        user_id: Number(formData.user_id),
      };

      const { isConfirmed } = await Swal.fire({
        title: '¿Confirmar registro del sueldo?',
        html: `
          <div style="text-align:left">
            <b>Colaborador:</b> ${selectedUserName || '(sin seleccionar)'}<br/>
            <b>Detalle:</b> ${salaryData.detail || '(sin detalle)'}<br/>
            <b>Sueldo:</b> ${salaryData.salarie || '0'}<br/>
            <b>Fecha:</b> ${salaryData.date || '(sin fecha)'}
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#CDEA80',
        cancelButtonColor: '#FF735C',
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
          text: response.msg || 'El sueldo se guardó correctamente',
          confirmButtonColor: '#CDEA80',
        });
        setFormData({ user_id: '', detail: '', salarie: '', date: '' });
        setSelectedUser('');
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.msg || 'Ha ocurrido un error al guardar el sueldo',
          confirmButtonColor: '#FF735C',
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        text: 'Ha ocurrido al intentar agregar el sueldo.',
        confirmButtonColor: '#FF735C',
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
          confirmButtonColor: '#FF735C',
        });
      } finally {
        setLoading(false);
      }

    };

    fetchData();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileSelected(!!file);
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (result) => {
          console.log('Raw parsed data:', result.data);

          const requiredColumns = ['user_id', 'salarie', 'detail', 'date'];
          const csvColumns = result.meta.fields || [];
          const missingColumns = requiredColumns.filter(col => !csvColumns.includes(col));

          if (missingColumns.length > 0) {
            await Swal.fire({
              title: 'CSV inválido',
              html: `
                <div style="text-align:left">
                  Faltan columnas obligatorias en el archivo:<br/>
                  <ul style="margin-top:8px; padding-left:18px;">
                    ${missingColumns.map(col => `<li><b>${col}</b></li>`).join('')}
                  </ul>
                  <small style="display:block; margin-top:12px;">
                    El CSV debe tener exactamente estas columnas:<br/>
                    <b>user_id, detail, salarie, date</b>
                  </small>
                </div>
              `,
              icon: 'error',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#CDEA80',
            });
            return;
          }
          const allowedColumns = ['user_id', 'detail', 'salarie', 'date'];
          const extraColumns = csvColumns.filter(col => !allowedColumns.includes(col));

          if (extraColumns.length > 0) {
            await Swal.fire({
              title: 'CSV con columnas no permitidas',
              html: `
                <div style="text-align:left">
                  El archivo contiene columnas no permitidas:<br/>
                  <ul style="margin-top:8px; padding-left:18px;">
                    ${extraColumns.map(col => `<li><b>${col}</b></li>`).join('')}
                  </ul>
                  <small style="display:block; margin-top:12px;">
                    Solo se permiten estas columnas:<br/>
                    <b>user_id, detail, salarie, date</b>
                  </small>
                </div>
              `,
              icon: 'error',
              confirmButtonText: 'Corregir CSV',
              confirmButtonColor: '#CDEA80',
            });
            return;
          }

          const updatedData = result.data
            .map((row: any, rowIndex: number) => {
       
              const errors: string[] = [];

              const userId = Number(row.user_id);
              if (!row.user_id || !Number.isInteger(userId) || userId <= 0) {
                errors.push('user_id debe ser un número entero positivo');
              }

              const salarie = Number(row.salarie);
              if (!row.salarie || !Number.isFinite(salarie) || salarie <= 0) {
                errors.push('salarie debe ser un número positivo');
              }

              if (!row.detail || !String(row.detail).trim()) {
                errors.push('detail no puede estar vacío');
              }

              if (errors.length > 0) {
                return {
                  error: true,
                  rowIndex: rowIndex + 1,
                  errors,
                  row
                };
              }

              let resolvedDate = row.date && String(row.date).trim() ? String(row.date).trim() : '';

              const mmmPattern = /^[a-z]{3}-\d{2}$/i;
              const ddmmyyyyPattern = /^\d{2}\/\d{2}\/\d{4}$/;
              const yyyymmddPattern = /^\d{4}-\d{2}-\d{2}$/;

              if (mmmPattern.test(resolvedDate)) {
        
                const iso = firstDayFromMonthString(resolvedDate, 'YYYY-MM-DD');
                if (iso) resolvedDate = iso;
              } else if (ddmmyyyyPattern.test(resolvedDate)) {
               
                const [day, month, year] = resolvedDate.split('/');
                resolvedDate = `${year}-${month}-${day}`;
              } else if (!yyyymmddPattern.test(resolvedDate)) {
           
                errors.push('date tiene formato inválido (use DD/MM/YYYY)');
              }

    
              if (!resolvedDate || !dayjs(resolvedDate).isValid()) {
                errors.push('date tiene formato inválido');
              }

   
              if (errors.length > 0) {
                return {
                  error: true,
                  rowIndex: rowIndex + 1,
                  errors,
                  row
                };
              }

              return {
                user_id: Number(row.user_id),
                salarie: row.salarie,
                detail: row.detail,
                date: resolvedDate, 
              };
            })
            .filter((item): item is any => item !== null);


          const validRows = updatedData.filter((item: any) => !item?.error);
          const errorRows = updatedData.filter((item: any) => item?.error);


          if (errorRows.length > 0) {
        
            const errorsByType: Record<string, number[]> = {}
            
            errorRows.forEach((err: any) => {
              err.errors.forEach((errorMsg: string) => {
                if (!errorsByType[errorMsg]) {
                  errorsByType[errorMsg] = []
                }
                errorsByType[errorMsg].push(err.rowIndex)
              })
            })

            const errorSummary = Object.entries(errorsByType).map(([errorMsg, rows]) => {
              const rowList = rows.length > 10 
                ? `${rows.slice(0, 10).join(', ')}... (y ${rows.length - 10} más)`
                : rows.join(', ')
              
              return `
                <li style="margin-bottom:12px;">
                  <b>${errorMsg}</b><br/>
                  <span style="color:#666; font-size:0.9em;">Filas afectadas: ${rowList}</span>
                </li>
              `
            }).join('')

            await Swal.fire({
              title: `Se encontraron ${errorRows.length} fila${errorRows.length > 1 ? 's' : ''} con errores`,
              html: `
                <div style="text-align:left; max-height:400px; overflow-y:auto;">
                  <p style="margin-bottom:12px; font-weight:500;">Errores detectados:</p>
                  <ul style="padding-left:20px; margin-bottom:16px;">
                    ${errorSummary}
                  </ul>
                  <hr style="margin:16px 0; border-color:#e5e7eb;"/>
                  <div style="background:#f9fafb; padding:12px; border-radius:6px;">
                    <p style="font-weight:600; margin-bottom:8px;">Formato correcto del CSV:</p>
                    <small style="line-height:1.8;">
                      <b>Nombres de columnas (en inglés):</b><br/>
                      • <b>user_id:</b> número entero positivo<br/>
                      • <b>salarie:</b> número positivo (sin puntos ni comas)<br/>
                      • <b>date:</b> formato DD/MM/YYYY<br/>
                      • <b>detail:</b> texto no vacío
                    </small>
                  </div>
                </div>
              `,
              icon: 'error',
              confirmButtonText: 'Corregir CSV',
              confirmButtonColor: '#CDEA80',
              width: '650px',
            });
            return;
          }

          if (validRows.length > 0) {
            setSalaries(validRows as ISalaries[]);
          } else {
            await Swal.fire({
              icon: 'warning',
              title: 'CSV vacío',
              text: 'El archivo no contiene filas válidas.',
              confirmButtonColor: '#CDEA80',
            });
          }
        },
        error: async (err) => {
          console.error('Error reading CSV file:', err);
          await Swal.fire({
            title: 'Error al leer el archivo',
            text: 'Revisa que el CSV tenga cabeceras y el formato esperado.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#CDEA80',
          });
        },
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Formato no soportado',
        text: 'Por favor, sube un archivo con extensión .csv',
        confirmButtonColor: '#CDEA80',
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


      {viewMode === 'upload' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Selecciona el Mes para configurar el formato de tu archivo CSV.
          </label>
          <input
            type="month"
            name="csv_month"
            value={csvMonth ? (() => {
              const parsed = parseMonthString(csvMonth)
              if (!parsed) return ''
              const { year, monthIndex } = parsed
              return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
            })() : ''}
            onChange={(e) => {
              if (e.target.value) {
                const [year, month] = e.target.value.split('-')
                const monthIndex = parseInt(month) - 1
                const monthAbbr = MONTHS_ES[monthIndex]
                const yy = year.slice(-2)
                const monthStr = `${monthAbbr}-${yy}`
                setCsvMonth(monthStr)
              }
            }}
            className="outline-none block w-full md:w-auto rounded-md border px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400"
          />
          <div className="mt-3">
            <small className="block text-xs text-gray-500 mt-1">
              <b>Columnas requeridas:</b> Los nombres de las columnas están predefinidos en el formato CSV. Por favor, no editarlos.<br/>
              <b>Formato fecha:</b> El formato correspondiente para el campo fecha es DD/MM/YYYY.<br/>
            </small>
          </div>
        </div>
      )}

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
                Ingrese el Sueldo
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
                Seleccione el Mes
              </label>
              <input
                type="month"
                name="date"
                value={formData.date ? dayjs(formData.date).format('YYYY-MM') : ''}
                onChange={(e) => {
                  const selectedYearMonth = e.target.value; 
                  if (selectedYearMonth) {
                    const isoDate = `${selectedYearMonth}-01`;
                    setFormData({
                      ...formData,
                      date: isoDate,
                    });
                  }
                }}
                onClick={(e) => {
                  e.currentTarget.showPicker();
                }}
                className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 sm:text-sm sm:leading-6 cursor-pointer"
              />
            </div>

            <div className="col-span-full flex justify-end">
              <button
                type="button"
                onClick={handleSubmitForm}
                disabled={!isFormValid}
                className={`mt-2 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition
                  ${!isFormValid
                    ? 'bg-gray-400 text-[[#303031]] cursor-not-allowed'
                    : 'bg-[#CDEA80] text-[[#303031]] hover:bg-[#BDDEFF] hover:text-black'}
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
          <div className="flex gap-2 items-center">
            <input
              id="file_input"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="block w-full text-sm p-2 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            {fileSelected && (
              <button
                type="button"
                onClick={() => {
                  setSalaries([])
                  setFileSelected(false)
                  const fileInput = document.getElementById('file_input') as HTMLInputElement
                  if (fileInput) fileInput.value = ''
                }}
                className="[#303031]space-nowrap rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-[#303031] shadow-sm hover:bg-red-500"
                title="Limpiar archivo cargado"
              >
                ✕ Limpiar
              </button>
            )}
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
