import { useState } from 'react';
import Swal from 'sweetalert2';
import { getGenerarIngresos } from '../../api/costeo/get-costeo';
import { downloadCosteoCSV } from '../../functions/downloadCosteoCSV';
import { IDataIngresos } from '../../interfaces/costeo/ingresos.interface';
import { TableResultIngresos } from '../TableResultIngresos/TableResultIngresos';
import { LoadingCosteo } from '../LoadingCosteo/LoadingCosteo';
import { PickerIcon } from '../../assets/PickerIcon';
import { registerIncome } from '../../api/income_mensual/post.income_mensual';

export function IncomeSection() {
  const [selectedDate, setSelectedDate] = useState('');
  const [ingresos, setIngresos] = useState<IDataIngresos[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadButton, setShowUploadButton] = useState(false);
  const token = localStorage.getItem('token')!;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setShowUploadButton(false);
    try {
      const response = await getGenerarIngresos(selectedDate);
      const data = response?.data ?? [];

      if (!Array.isArray(data) || data.length === 0) {
        setIngresos([]);
        await Swal.fire({
          title: 'Sin datos',
          text: 'No se encontraron ingresos para el período seleccionado.',
          icon: 'info',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#CDEA80',
        });
        return;
      }

      setIngresos(data);
      setShowUploadButton(true);
    } catch (error) {
      console.log(error);
      await Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al obtener los ingresos.',
        icon: 'error',
        confirmButtonColor: '#FF735C',
        confirmButtonText: 'Cerrar',
      });
    } finally {
      setLoading(false);
    }
  };

  const registrarincome = async () => {
    const confirm = await Swal.fire({
      title: '¿Cargar ingresos?',
      text: 'Se enviarán los datos al sistema. Esta acción no se puede deshacer.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cargar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#CDEA80',
      cancelButtonColor: '#FF735C',
      
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const response = await registerIncome(ingresos, token);
      console.log(response);
      setShowUploadButton(true);

      await Swal.fire({
        title: '¡Carga Exitosa!',
        text: 'Los ingresos han sido cargados con éxito.',
        icon: 'success',
        confirmButtonColor: '#CDEA80',
        confirmButtonText: 'Aceptar',
      });
    } catch (error) {
      console.log(error);

      await Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al cargar los ingresos.',
        icon: 'error',
        confirmButtonColor: '#FF735C',
        confirmButtonText: 'Cerrar',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleClickDownload = () => {
    downloadCosteoCSV({
      ingresosData: ingresos,
      selectedDate,
      nameFile: 'Ingresos',
    });
  };

  return (
    <section className="bg-white rounded-lg">
      <div className="mx-auto max-w-2xl text-center mb-8 translate-y-12">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">
          Ingresos
        </h2>
        <p className="mt-4 text-lg leading-6 text-gray-600">
          En esta sección podrás actualizar los ingresos por proyectos.
        </p>
      </div>

      <div className="max-w-sm mx-auto flex flex-col translate-y-12 space-y-4">
        <label
          htmlFor="datePicker"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Selecciona el mes y año
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <PickerIcon />
          </div>
          <input
            type="month"
            id="datePicker"
            name="datePicker"
            value={selectedDate}
            onChange={handleDateChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Selecciona fecha"
          />
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          <button
            type="button"
            disabled={!selectedDate || loading}
            onClick={handleSubmit}
            className={`rounded-md px-4 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              selectedDate && !loading
                ? 'bg-[#CDEA80] text-[[#303031]] hover:bg-[#BDDEFF] hover:text-black focus-visible:outline-indigo-600'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            } w-3/5`}
          >
            Mostrar
          </button>

            <button
              type="button"
              disabled={!showUploadButton || loading}
              onClick={registrarincome}
              className={`w-64 rounded-md px-4 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                showUploadButton && !loading
                  ? 'bg-[#CDEA80] text-[[#303031]] hover:bg-[#BDDEFF] hover:text-black focus-visible:outline-indigo-600'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              Cargar a sistema
            </button>

        </div>
      </div>

      {loading && (
        <LoadingCosteo
          title="Mostrando ingresos por proyectos..."
          subtitle="Espera un momento, por favor."
        />
      )}

      {!loading && ingresos.length > 0 && (
        <>
          <div className="w-[100%] text-end mb-8 translate-y-12">
            <button
              onClick={handleClickDownload}
              className="w-48 bg-[#CDEA80] text-[[#303031]] hover:bg-[#BDDEFF] hover:text-black focus-visible:outline-[#BDDEFF] mt-2 rounded-md px-1.5 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Descargar como CSV
            </button>

            <TableResultIngresos data={ingresos} />
          </div>
          <div className="text-center mt-4"></div>
        </>
      )}
    </section>
  );
}
