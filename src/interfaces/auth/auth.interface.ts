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
