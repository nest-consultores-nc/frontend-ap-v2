import { fetchFromApi } from './helpers' 
import type { ISalaries } from '../../interfaces/salaries/salaries.interface'
 
const SALARIES_BASE = 'salaries-api'

type BackendSalaryPayload = {
  user_id: number
  amount: number
  detail: string
  date: string
}

function toBackendPayload(s: ISalaries): BackendSalaryPayload {
  const amountNumber = Number(String(s.salarie ?? '0').replace(/[^\d.-]/g, '')) || 0
  return {
    user_id: Number(s.user_id),
    amount: amountNumber,
    detail: String(s.detail ?? ''),
    date: String(s.date ?? '').slice(0, 10),
  }
}

export async function addSalary(token: string, input: ISalaries): Promise<{ id: number }> {
  const payload = toBackendPayload(input)
  return fetchFromApi<{ id: number }>(`${SALARIES_BASE}/add-salary`, token, 'POST', payload)
}

export async function updateSalary(token: string, id: number, input: ISalaries): Promise<{ id: number }> {
  const payload = toBackendPayload(input)
  return fetchFromApi<{ id: number }>(`${SALARIES_BASE}/update-salary/${id}`, token, 'PUT', payload)
}

export async function deleteSalary(token: string, id: number): Promise<void> {
  await fetchFromApi(`${SALARIES_BASE}/delete-salary/${id}`, token, 'DELETE')
}