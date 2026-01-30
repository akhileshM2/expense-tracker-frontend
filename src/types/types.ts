import type { ReactNode } from "react"

export interface User {
  token: string
  name: string
  email: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (userData: User) => void
  logout: () => void
}

export interface AuthProviderProps {
  children: ReactNode
}