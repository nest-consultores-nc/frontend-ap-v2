import { NavigateFunction } from 'react-router-dom'
import { checkToken } from '../api/auth'

export const checkTokenAndRedirect = async (
  navigate: NavigateFunction
): Promise<void> => {
  const token = localStorage.getItem('token')!
  if (!token) {
    localStorage.clear()
    navigate('/iniciar-sesion')
    return
  }

  try {
    const response = await checkToken(
      'authorization-api/check-token',
      token,
      'GET'
    )

    if (
      !response.success ||
      response.msg === 'Token not found' ||
      response.data === null
    ) {
      // Si el token no es válido o no se encuentra, limpiar y redirigir
      localStorage.clear()
      navigate('/unauthorized')
    }
  } catch (error) {
    console.error('Error verifying token:', error)
    localStorage.clear()
    navigate('/unauthorized')
  }
}
