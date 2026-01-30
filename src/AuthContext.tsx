import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  token: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const name = localStorage.getItem("name")
    const email = localStorage.getItem("email")

    if (token && name && email) {
      setUser({ token, name, email })
    }
    setLoading(false)
  }, [])

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
      loading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}