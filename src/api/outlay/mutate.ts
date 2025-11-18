import { fetchFromApi } from '.'
import { IOutlayData } from '../../interfaces/outlay/outlay.interface'

 
export const createOutlayQuery = async (token: string, data: IOutlayData) => {
  const response = await fetchFromApi<{ msg: string; status: number }>(
    'outlay-api/create-outlay',
    token,
    'POST',
    data
  )
  return { msg: response.msg, status: response.status }
}

 
export const addOutlay = (token: string, data: IOutlayData) =>
  fetchFromApi<{ id: number }>('outlay-api/add-outlay', token, 'POST', data)

 
export const updateOutlay = (token: string, id: number, data: IOutlayData) =>
  fetchFromApi<{ status: number }>(`outlay-api/update-outlay/${id}`, token, 'PUT', data)

 
export const deleteOutlay = (token: string, id: number) =>
  fetchFromApi<{ status: number }>(`outlay-api/delete-outlay/${id}`, token, 'DELETE')
