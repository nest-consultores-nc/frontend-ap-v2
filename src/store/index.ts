import { create } from 'zustand'
import { IStoreState } from '../interfaces/auth/auth.interface'

export const useAuthStore = create<IStoreState>((set) => ({
  id: '',
  token: '',
  isAuth: false,
  role: '',
  name: '',
  email: '',
  setId: (id: string) => set({ id }),
  setToken: (token: string) => set({ token }),
  setIsAuth: (isAuth: boolean) => set({ isAuth }),
  setRole: (role: string) => set({ role }),
  setName: (name: string) => set({ name }),
  setEmail: (email: string) => set({ email }),
}))
