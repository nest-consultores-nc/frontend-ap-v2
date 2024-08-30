import { fetchFromApi } from '.'

export const deleteDedicationByIdQuery = async (
  idDedication: number,
  token: string
) => {
  const response = await fetchFromApi<{
    success: boolean
    msg: string
  }>(`dedicacion-api/eliminar-dedicacion/${idDedication}`, token, 'DELETE')

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
