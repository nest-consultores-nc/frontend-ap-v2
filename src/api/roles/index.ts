import { IRole, IWorkday } from '../../interfaces/roles/roles.interface'
import { getBaseUrl } from '../auth/index'

export const getAllRolesAndWorkday = async (path: string, token: string) => {
  const url = `${getBaseUrl()}/${path}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      roles: data.roles as IRole[],
      workday: data.workday as IWorkday[],
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching roles:', error.message)
    return {
      roles: [],
      workday: [],
    }
  }
}
