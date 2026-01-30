import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Dashboard } from './pages/Dashboard'
import { AuthProvider, useAuth } from './AuthContext'

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/signin" element={!isAuthenticated ? <Signin /> : <Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/signin"} />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
