import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Cadastro from './pages/Cadastro.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
