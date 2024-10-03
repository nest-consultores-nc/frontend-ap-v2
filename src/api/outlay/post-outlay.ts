import { fetchFromApi } from '.'
import { IOutlayData } from '../../interfaces/outlay/outlay.interface'

export const createOutlayQuery = async (token: string, data: IOutlayData) => {
  try {
    const response = await fetchFromApi<{ msg: string; status: number }>(
      'outlay-api/create-outlay',
      token,
      'POST',
      data
    )

    return {
      msg: response.msg,
      status: response.status,
    }
  } catch (error) {
    console.log(error)
    return {
      msg: 'Ha ocurrido un error en la creación del desembolso',
      status: 500,
    }
  }
}
