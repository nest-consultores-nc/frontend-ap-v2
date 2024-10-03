import { fetchFromApi } from '.'
import {
  IOutlay,
  IOutlayCategories,
} from '../../interfaces/outlay/outlay.interface'

export const getAllOutlayData = (
  token: string,
  userId: string,
  email: string
) =>
  fetchFromApi<IOutlay>(
    `outlay-api/get-all-outlay-data/${userId}/${email}`,
    token
  )
export const getOutlayCategoriesQuery = (token: string) =>
  fetchFromApi<IOutlayCategories>('outlay-api/get-all-outlay-categories', token)

