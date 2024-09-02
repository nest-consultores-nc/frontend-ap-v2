import React, {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react'

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
  const [auth, setAuth] = useState<AuthState>({
    id: 0,
    token: '',
    isAuth: false,
    role: '',
    name: '',
    email: '',
  })

  return (
    <HomeContext.Provider value={[auth, setAuth]}>
      {children}
    </HomeContext.Provider>
  )
}

export { HomeContext, HomeProvider }
