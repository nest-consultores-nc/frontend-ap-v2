import { fetchFromApi } from '.'
import { IUserProfile } from '../../dashboard/edit-profile/page'

export const editProfileQuery = async (data: IUserProfile, token: string) => {
  console.log(data)

  const response = await fetchFromApi<{
    success: boolean
    msg: string
  }>(`users-api/editar-perfil`, token, 'PUT', data)

  if (response && response.success) {
    return { success: true, msg: response.msg }
  } else {
    return {
      success: false,
      msg:
        response?.msg ||
        'Error desconocido al intentar actualizar la dedicación',
    }
  }
}
