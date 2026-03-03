import { useEffect, useState } from 'react';
import { IUsers } from '../../interfaces/users/users.interface';
import { getAllUsers } from '../../api/users';
import { toggleUserStatus } from '../../api/users';
import { Alerts, LoadingSpinner } from '../../components';
import { useNavigate } from 'react-router-dom';
import { HeaderPages } from '../../components';
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect';
import Swal from 'sweetalert2';

export default function DisableUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<IUsers[]>([]);
  const [alert, setAlert] = useState(false);
  const [error, setError] = useState({ success: false, msg: '' });
  const [selectedUserId, setSelectedUserId] = useState<number>();

  useEffect(() => {
    checkTokenAndRedirect(navigate);
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllUsers('users-api/obtener-usuarios-admin', localStorage.getItem('token')!);
        setUsers(data);
      } catch (error) {
        setError({ success: false, msg: 'Error al cargar los usuarios' });
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(Number(event.target.value));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const selectedUser = users.find((u) => u.id === selectedUserId);
    if (!selectedUser) return;

    const isActive = selectedUser.active === 1;
    const accion = isActive ? 'desactivar' : 'activar';
    const accionPasado = isActive ? 'desactivado' : 'activado';

    Swal.fire({
      title: '¿Estás de acuerdo?',
      text: `Se va a ${accion} al usuario "${selectedUser.name}". ¿Deseas continuar?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#CDEA80',
      cancelButtonColor: '#FF735C',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setAlert(false);

          const response = await toggleUserStatus(
            selectedUser.id,
            localStorage.getItem('token')!
          );

          setError({ success: response.success, msg: response.msg });

          if (response.success) {
            setUsers((prev) =>
              prev.map((u) =>
                u.id === selectedUser.id
                  ? { ...u, active: response.active ?? u.active }
                  : u
              )
            );

            Swal.fire({
              title: 'Listo',
              text: `El usuario "${selectedUser.name}" ha sido ${accionPasado}.`,
              icon: 'success',
            });
          }

          setAlert(true);
        } catch (error) {
          console.error(error);
          setError({ success: false, msg: 'Error al cambiar el estado del usuario.' });
          setAlert(true);
        }
      }
    });
  };

  const handleCloseAlert = () => setAlert(false);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <form onSubmit={handleSubmit}>
      {alert && (
        <Alerts
          message={error.success ? 'Estado actualizado:' : 'Ha ocurrido un error:'}
          success={error.success}
          subtitle={error.msg}
          close={handleCloseAlert}
        />
      )}
      <HeaderPages
        titlePage="Activar / Desactivar Usuario"
        subTitlePage="Selecciona un usuario para cambiar su estado en la plataforma. Los usuarios inactivos no podrán iniciar sesión ni acceder a sus proyectos, pero su información se mantendrá intacta para futuras reactivaciones."
      />

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Seleccione el Usuario
            </label>
            <div className="mt-2">
              <select
                value={selectedUserId ?? ''}
                onChange={handleChange}
                className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-40 sm:text-sm sm:leading-6"
              >
                <option value="" disabled>
                  Seleccione un usuario
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} — {user.active === 1 ? 'Activo' : 'Inactivo'}
                  </option>
                ))}
              </select>
            </div>

            {selectedUser && (
              <p className="mt-3 text-sm text-gray-600">
                Este usuario está actualmente{' '}
                <span className={`font-semibold ${selectedUser.active === 1 ? 'text-green-600' : 'text-red-500'}`}>
                  {selectedUser.active === 1 ? 'activo' : 'inactivo'}
                </span>
                . Al confirmar lo{' '}
                <span className="font-semibold">
                  {selectedUser.active === 1 ? 'desactivarás' : 'activarás'}
                </span>
                .
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
            ${
              selectedUserId
                ? 'bg-[#CDEA80] text-[#303031] hover:bg-[#BDDEFF] hover:text-black focus-visible:outline-indigo-600'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          disabled={!selectedUserId}
        >
          Confirmar
        </button>
      </div>
    </form>
  );
}