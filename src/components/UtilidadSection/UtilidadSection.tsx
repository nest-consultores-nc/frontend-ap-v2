import { useState } from 'react';
import Swal from 'sweetalert2';
import { Datum } from '../../interfaces/costeo/utilidad.interface';
import { getGenerarUtilidad } from '../../api/costeo/get-costeo';
import { downloadCosteoCSV } from '../../functions/downloadCosteoCSV';
import { TableResultUtilidad } from '../TableResultUtilidad/TableResultUtilidad';
import { LoadingCosteo } from '../LoadingCosteo/LoadingCosteo';
import { registerUtility } from '../../api/utilidad/post-utilidad';

export function UtilidadSection() {
  const [loading, setLoading] = useState(false);
  const [utilidad, setUtilidad] = useState<Datum[]>([]);
  const [showUploadButton, setShowUploadButton] = useState(false);
  const token = localStorage.getItem('token')!;

  const handleSubmit = async () => {
    setLoading(true);
    setShowUploadButton(false); 
    try {
      const response = await getGenerarUtilidad();
      
      setUtilidad(response.data);
      setShowUploadButton(true); 
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const registrarutilidad = async () => {
    const confirm = await Swal.fire({
      title: '¿Cargar utilidades?',
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
      const response = await registerUtility(utilidad, token);
      console.log(response);
      setShowUploadButton(true);

      await Swal.fire({
        title: '¡Carga Exitosa!',
        text: 'Las utilidades han sido cargadas con éxito.',
        icon: 'success',
        confirmButtonColor: '#CDEA80',
        confirmButtonText: 'Aceptar',
      });
    } catch (error) {
      console.log(error);

      await Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al cargar las utilidades.',
        icon: 'error',
        confirmButtonColor: '#FF735C',
        confirmButtonText: 'Cerrar',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleClickDownload = () => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${today.getFullYear()}`;

    downloadCosteoCSV({
      datumData: utilidad,
      nameFile: 'utilidad',
      selectedDate: formattedDate,
    });
  };

  return (
    <section className="white">
      <div className="mx-auto max-w-2xl text-center translate-y-12">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Utilidades
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          En esta sección puedes actualizar las utilidades de los distintos proyectos
          mes a mes.
        </p>
        <div className="max-w-sm mx-auto flex justify-center space-x-4 mt-6">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className={`rounded-md px-4 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
            ${
              !loading
                ? 'bg-[#CDEA80] text-[#303031] hover:bg-[#BDDEFF] hover:text-black focus-visible:outline-indigo-600'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            } w-3/5`}
          >
            Mostrar
          </button>
            <button
              type="button"
              disabled={!showUploadButton || loading}
              onClick={registrarutilidad}
              className={`w-64 rounded-md px-4 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
              ${
                showUploadButton && !loading
                  ? 'bg-[#CDEA80] text-[#303031] hover:bg-[#BDDEFF] hover:text-black focus-visible:outline-indigo-600'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              Cargar a sistema
            </button>

        </div>
      </div>

      {loading && (
        <LoadingCosteo
          title="Mostrando utilidades..."
          subtitle="Espera un momento, por favor."
        />
      )}

      {!loading && utilidad.length > 0 && (
        <>
          <div className="w-[100%] text-end mb-8 translate-y-12">
            <button
              onClick={handleClickDownload}
              className="w-48 bg-[#CDEA80] text-[#303031] hover:bg-[#BDDEFF] hover:text-black focus-visible:outline-[#BDDEFF] mt-2 rounded-md px-1.5 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Descargar como CSV
            </button>

            <TableResultUtilidad data={utilidad} />
          </div>
          <div className="text-center mt-4"></div>
        </>
      )}
    </section>
  );
}
