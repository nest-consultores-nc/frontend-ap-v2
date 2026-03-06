import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react'
import { checkTokenAndRedirect } from '../functions/checkTokenAndRedirect'
import { useNavigate } from 'react-router-dom'

interface AuthState {
  id: number
  token: string
  isAuth: boolean
  role: string
  name: string
  email: string
}

type HomeContextType = [AuthState, Dispatch<SetStateAction<AuthState>>]

const HomeContext = createContext<HomeContextType | undefined>(undefined)

interface HomeProviderProps {
  children: ReactNode
}

const HomeProvider: React.FC<HomeProviderProps> = ({ children }) => {
  const navigate = useNavigate()

  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const token = localStorage.getItem('token')
      const id = localStorage.getItem('id')
      const name = localStorage.getItem('name')
      const email = localStorage.getItem('email')
      const role = localStorage.getItem('role')

      if (token && id) {
        return {
          id: Number(id),
          token,
          isAuth: true,
          role: role ?? '',
          name: name ?? '',
          email: email ?? '',
        }
      }
    } catch {}
    return { id: 0, token: '', isAuth: false, role: '', name: '', email: '' }
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      checkTokenAndRedirect(navigate)
    }
  }, [])

  return (
    <HomeContext.Provider value={[auth, setAuth]}>
      {children}
    </HomeContext.Provider>
  )
}

export { HomeContext, HomeProvider }