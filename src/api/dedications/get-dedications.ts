import { fetchFromApi } from '.'
import {
  IDedicationsByUserId,
  ITableDedications,
} from '../../interfaces/dedications/dedications.interfaces'

export const getHistoryDedicationsByUserId = (token: string, userId: number) =>
  fetchFromApi<{ dedications: ITableDedications[] }>(
    `dedicacion-api/dedicaciones/${userId}`,
    token
  )
export const getDedicationsNotConsolidated = (token: string, userId: number) =>
  fetchFromApi<{ dedications: IDedicationsByUserId[] }>(
    `dedicacion-api/dedicaciones-no-consolidadas/${userId}`,
    token
  )
