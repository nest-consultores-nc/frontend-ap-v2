import { IRole, IWorkday } from '../../interfaces/roles/roles.interface'

export const getAllRolesAndWorkday = async (path: string, token: string) => {
  const url = `https://agenciapolux-backend-production.up.railway.app/agencia-polux/api/v1/${path}`

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
