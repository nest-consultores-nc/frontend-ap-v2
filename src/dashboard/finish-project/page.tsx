import { useEffect, useState } from 'react';
import { IProject } from '../../interfaces/projects/projects.interface';
import { getAllProjects } from '../../api/projects/get-projects';
import { deleteProjectQuery } from '../../api/projects/delete-projects';
import { Alerts, LoadingSpinner } from '../../components';
import { useNavigate } from 'react-router-dom';
import { HeaderPages } from '../../components';
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect';
import Swal from 'sweetalert2';

export default function FinishProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [alert, setAlert] = useState(false);
  const [error, setError] = useState({
    success: false,
    msg: '',
  });

  const [selectedDeleteProject, setSelectedDeleteProject] = useState<number>();

  useEffect(() => {
    checkTokenAndRedirect(navigate);
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllProjects(localStorage.getItem('token')!, true);
        setProjects(data.projects);
      } catch (error) {
        setError({ success: false, msg: 'Error al cargar los datos' });
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeleteProject(Number(event.target.value));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Buscar el nombre del proyecto seleccionado
    const selectedProject = projects.find(
      (project) => project.id === selectedDeleteProject
    );
    const projectName = selectedProject
      ? `${selectedProject.client.clientName} - ${selectedProject.project_name}`
      : '';

    // Mostrar advertencia de SweetAlert antes de proceder
    Swal.fire({
      title: '¿Estás de acuerdo?',
      text: `Se va eliminar el proyecto "${projectName}" No podrás revertir esta acción`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, terminar proyecto',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setAlert(false);

          const response = await deleteProjectQuery(
            selectedDeleteProject!,
            localStorage.getItem('token')!
          );

          setError({ success: response.success, msg: response.msg });
          setProjects((prevProjects) =>
            prevProjects.filter(
              (project) => project.id !== selectedDeleteProject
            )
          );

          setAlert(true);

          // Mostrar confirmación de eliminación
          Swal.fire({
            title: '¡Terminado!',
            text: `El proyecto "${projectName}" ha sido terminado.`,
            icon: 'success',
          });
        } catch (error) {
          console.log(error);
          setError({ success: false, msg: 'Error al enviar el formulario.' });
          setAlert(true);
        }
      }
    });
  };

  const handleCloseAlert = () => {
    setAlert(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {alert && (
        <Alerts
          message={
            error.success === false
              ? 'Ha ocurrido un error: '
              : 'Se ha terminado el proyecto:'
          }
          success={error.success}
          subtitle={error.msg}
          close={handleCloseAlert}
        />
      )}
      <HeaderPages
        titlePage="Terminar Proyecto"
        subTitlePage="Debes seleccionar el proyecto que desees terminar. Este no se borrará de los registros, pero ya no podrán ingresar dedicaciones."
      />

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Seleccione el Proyecto
            </label>
            <div className="mt-2">
              <select
                value={selectedDeleteProject ?? ''}
                onChange={handleChange}
                className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-40 sm:text-sm sm:leading-6"
              >
                <option value="" disabled>
                  Seleccione un proyecto
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.client.clientName} - {project.project_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
            ${
              selectedDeleteProject
                ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          disabled={!selectedDeleteProject || selectedDeleteProject === 0}
        >
          Confirmar
        </button>
      </div>
    </form>
  );
}
