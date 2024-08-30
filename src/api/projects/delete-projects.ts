import { fetchFromApi } from '.'

export const deleteProjectQuery = async (idProject: number, token: string) => {
  const response = await fetchFromApi<{
    success: boolean
    msg: string
  }>(`proyectos-api/terminar-proyecto-por-id/${idProject}`, token, 'POST')

  if (response && response.success) {
    return { success: true, msg: response.msg }
  } else {
    return {
      success: false,
      msg: response?.msg || 'Error desconocido al crear el proyecto',
    }
  }
}
