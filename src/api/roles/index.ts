import { IRole, IWorkday } from '@/app/interfaces/roles/roles.interface'

export const getAllRolesAndWorkday = async (path: string, token: string) => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL_BACKEND}/${path}`

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
  } catch (error: any) {
    console.error('Error fetching roles:', error.message)
    return {
      roles: [],
      workday: [],
    }
  }
}
