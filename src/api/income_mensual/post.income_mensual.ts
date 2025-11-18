import { fetchFromApi } from '.'
import { IDataIngresos } from '../../interfaces/costeo/ingresos.interface'


export const registerIncome = async (data: IDataIngresos[], token: string) => {
    const response = await fetchFromApi<{
      msg: string
    }>('income-mensual-api/registrar-income-mensual', token, 'POST', data)
  
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
  