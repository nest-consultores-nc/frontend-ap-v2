import { fetchFromApi } from '.'
import { IIncome } from '../../interfaces/income/income.interface'

export const createIncomeQuery = async (data: IIncome[], token: string) => {
  const response = await fetchFromApi<{
    success: boolean
    msg: string
  }>('income-api/create-income', token, 'POST', data)

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
