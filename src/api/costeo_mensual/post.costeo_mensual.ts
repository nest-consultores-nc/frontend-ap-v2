import { fetchFromApi } from '.'
import { ICosteoMensual } from '../../interfaces/costeo/costeo-mensual.interface'


export const registerCost = async (data: ICosteoMensual[], token: string) => {
    const response = await fetchFromApi<{
      msg: string
    }>('projects-costs-api/registrar-projects-costs', token, 'POST', data)
  
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
  