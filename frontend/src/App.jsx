import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Cadastro from './pages/Cadastro.jsx'
import Vitrine from './pages/Vitrine.jsx'
import AnuncioDetalhe from './pages/AnuncioDetalhe.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/anuncios" element={<Vitrine />} />
      <Route path="/anuncios/:id" element={<AnuncioDetalhe />} />
      <Route path="*" element={<Navigate to="/anuncios" replace />} />
    </Routes>
  )
}
