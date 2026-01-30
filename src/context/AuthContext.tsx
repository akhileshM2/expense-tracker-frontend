import React, { useState } from 'react'
import type { AuthProviderProps, User } from '../types/types'
import { AuthContext } from '../hooks/useAuth'

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem("token")
    const name = localStorage.getItem("name")
    const email = localStorage.getItem("email")

    if (token && name && email) {
      return { token, name, email }
    }
    return null;
  })

  const login = (userData: User) => {
    localStorage.setItem("token", userData.token)
    localStorage.setItem("name", userData.name)
    localStorage.setItem("email", userData.email)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("name")
    localStorage.removeItem("email")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}