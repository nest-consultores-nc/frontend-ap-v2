import { fetchFromApi } from '.'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const editDedicationQuery = async (data: any, token: string) => {
  const response = await fetchFromApi<{
    success: boolean
    msg: string
  }>(`dedicacion-api/actualizar-dedicacion`, token, 'PATCH', data)

  if (response && response.success) {
    return { success: true, msg: response.msg }
  } else {
    return {
      success: false,
      msg:
        response?.msg || 'Error desconocido al intentar borrar la dedicación',
    }
  }
}

export const updateConsolidationsQuery = async (data: any, token: string) => {
  console.log(data)
  const response = await fetchFromApi<{
    success: boolean
    msg: string
  }>(`dedicacion-api/actualizar-consolidacion`, token, 'PATCH', data)
  if (response && response.success) {
    return { success: true, msg: response.msg }
  } else {
    return {
      success: false,
      msg: response?.msg,
    }
  }
}
