import React, {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react'

interface AuthState {
  id: string
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

const HomeProvider: React.FC<HomeProviderProps> = (props) => {
  const [auth, setAuth] = useState<AuthState>({
    id: '',
    token: '',
    isAuth: false,
    role: '',
    name: '',
    email: '',
  })

  return (
    <HomeContext.Provider value={[auth, setAuth]}>
      {props.children}
    </HomeContext.Provider>
  )
}

export { HomeContext, HomeProvider }
