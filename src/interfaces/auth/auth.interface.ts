export interface ILogin {
  success: boolean
  msg: string
  token: string
  user: User
}

export interface User {
  id: number
  name: string
  email: string
  role: string
}

export interface IStoreState {
  id: string
  token: string
  isAuth: boolean
  role: string
  name: string
  email: string
  setId: (id: string) => void
  setToken: (token: string) => void
  setIsAuth: (isAuth: boolean) => void
  setRole: (role: string) => void
  setName: (name: string) => void
  setEmail: (email: string) => void
}

export interface IUserAuthData {
  id: string
  token: string
  isAuth: boolean
  role: string
  name: string
  email: string
}
