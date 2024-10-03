import { fetchFromApi } from '.'
import { ISalaries } from '../../interfaces/salaries/salaries.interface'

export const createSalarieQuery = async (data: ISalaries[], token: string) => {
  const response = await fetchFromApi<{
    success: boolean
    msg: string
  }>('salaries-api/registrar-salario', token, 'POST', data)

  console.log(response)
  if (response && response.success) {
    return { success: true, msg: response.msg }
  } else {
    return {
      success: false,
      msg: response?.msg || 'Error desconocido al crear el proyecto',
    }
  }
}
