import { fetchFromApi } from '.'
import { Datum } from '../../interfaces/costeo/utilidad.interface'


export const registerUtility = async (data: Datum[], token: string) => {
  const response = await fetchFromApi<{
    msg: string
  }>('registrar-utilidad-api/registrar-utilidad', token, 'POST', data)

  console.log(response)
  if (response && response.msg) {
    return { success: true, msg: response.msg }
  } else {
    return {
      success: false,
      msg: response?.msg || 'Error desconocido al crear el proyecto',
    }
  }
}
