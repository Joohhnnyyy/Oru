import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './app/RequireAuth'
import SignIn from './pages/auth/SignIn'
import Home from './pages/citizen/Home'
import Scan from './pages/citizen/Scan'
import Overview from './pages/console/Overview'
import ReviewQueue from './pages/console/ReviewQueue'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/scan" element={<RequireAuth><Scan /></RequireAuth>} />
          <Route path="/console" element={<RequireAuth group="ward_admin"><Overview /></RequireAuth>} />
          <Route path="/console/review" element={<RequireAuth group="ward_admin"><ReviewQueue /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
