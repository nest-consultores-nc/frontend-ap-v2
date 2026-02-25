import { fetchFromApi } from './helpers' 

const SALARIES_BASE = 'salaries-api'

export async function getSalaries(token: string): Promise<{ data: any[] }> {
  return fetchFromApi<{ data: any[] }>(`${SALARIES_BASE}/get-salaries`, token, 'GET')
}

export async function getSalaryById(token: string, id: number): Promise<{ data: any }> {
  return fetchFromApi<{ data: any }>(`${SALARIES_BASE}/get-salary/${id}`, token, 'GET')
}