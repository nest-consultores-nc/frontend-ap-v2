import { fetchFromApi } from '.'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const insertDedication = async (data: any, token: string) => {
  try {
    const response = await fetchFromApi<{
      success: boolean
      msg: string
    }>(`dedicacion-api/ingresar-dedicacion`, token, 'POST', data)

    if (response && response.success) {
      return { success: true, msg: response.msg }
    } else {
      return {
        success: false,
        msg: response?.msg || 'Error al ingresar nueva dedicación',
      }
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      msg: 'Error en la conexión con la API',
    }
  }
}
