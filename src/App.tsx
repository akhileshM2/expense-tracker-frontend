import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Dashboard } from './pages/Dashboard'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={loggedUser() ? <Navigate to={"/dashboard"} replace /> : <Signin />} />
          <Route path='/dashboard' element={loggedUser() ? <Dashboard /> : <Navigate to={"/signin"} replace />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/*' element={<Signin />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

const loggedUser = () => {
    const loggedUserToken = localStorage.getItem("token") || false
    const loggedUserName = localStorage.getItem("name") || false
    const loggedUserEmail = localStorage.getItem("email") || false

    return loggedUserToken && loggedUserName && loggedUserEmail
  }

export default App
