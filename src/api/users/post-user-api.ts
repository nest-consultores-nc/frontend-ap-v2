import { fetchFromApi } from '.'
import { IUserForm } from '../../interfaces/users/users.interface'

// Interfaz para la respuesta de la API

export const createUserAccount = async (data: IUserForm, token: string) => {
  const response = await fetchFromApi<{
    success: boolean
    msg: string
  }>('users-api/crear-usuario', token, 'POST', data)

  if (response && response.success) {
    return { success: true, msg: response.msg }
  } else {
    return {
      success: false,
      msg: response?.msg || 'Error desconocido al crear el proyecto',
    }
  }
}
