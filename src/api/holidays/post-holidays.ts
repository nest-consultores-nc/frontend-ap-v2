import { fetchFromApi } from '.'
import { IIHolidayForm } from '../../dashboard/holidays/page'

export const createHolidayQuery = async (
  data: IIHolidayForm,
  token: string
) => {
  const response = await fetchFromApi<{
    success: boolean
    msg: string
  }>('holidays-api/crear-feriado', token, 'POST', data)

  console.log(response)
  if (response && response.success) {
    return { success: true, msg: response.msg }
  } else {
    return {
      success: false,
      msg: response?.msg || 'Error desconocido al registrar el día libre',
    }
  }
}