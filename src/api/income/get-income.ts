import { fetchFromApi } from '.'
import { IIncome } from '../../interfaces/income/income.interface'

export const getAllIncomes = async (token: string): Promise<IIncome[]> => {
  try {
    const response = await fetchFromApi<IIncome[]>('income', token, 'GET')
    return response
  } catch (error) {
    console.error('Error fetching incomes:', error)
    throw error
  }
}
