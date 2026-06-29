import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Cadastro from './pages/Cadastro.jsx'
import Vitrine from './pages/Vitrine.jsx'
import AnuncioDetalhe from './pages/AnuncioDetalhe.jsx'
import MeusCarros from './pages/MeusCarros.jsx'
import CadastrarVeiculo from './pages/CadastrarVeiculo.jsx'
import MinhasCompras from './pages/MinhasCompras.jsx'
import MinhasVendas from './pages/MinhasVendas.jsx'
import AdminUsuarios from './pages/AdminUsuarios.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/anuncios" element={<Vitrine />} />
      <Route path="/anuncios/:id" element={<AnuncioDetalhe />} />
      <Route path="/admin" element={<Navigate to="/admin/usuarios" replace />} />
      <Route
        path="/admin/usuarios"
        element={
          <RequireAuth>
            <RequireAdmin>
              <AdminUsuarios />
            </RequireAdmin>
          </RequireAuth>
        }
      />
      <Route
        path="/carros/meus"
        element={
          <RequireAuth>
            <MeusCarros />
          </RequireAuth>
        }
      />
      <Route
        path="/carros/novo"
        element={
          <RequireAuth>
            <CadastrarVeiculo />
          </RequireAuth>
        }
      />
      <Route
        path="/vendas/minhas-compras"
        element={
          <RequireAuth>
            <MinhasCompras />
          </RequireAuth>
        }
      />
      <Route
        path="/vendas/minhas-vendas"
        element={
          <RequireAuth>
            <MinhasVendas />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/anuncios" replace />} />
    </Routes>
  )
}
