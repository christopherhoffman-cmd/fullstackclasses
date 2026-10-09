import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MunicipiosPage from './pages/MunicipiosPage';
import CriteriosPage from './pages/CriteriosPage';
import ExecutarPage from './pages/ExecutarPage';
import ResultadoPage from './pages/ResultadoPage';
import HistoricoPage from './pages/HistoricoPage';
import MapaPage from './pages/MapaPage';
import ImportacaoPage from './pages/ImportacaoPage';
import UsuariosPage from './pages/UsuariosPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="municipios" element={<MunicipiosPage />} />
        <Route path="criterios" element={<CriteriosPage />} />
        <Route path="executar" element={<ExecutarPage />} />
        <Route path="simulacoes" element={<HistoricoPage />} />
        <Route path="simulacoes/:id" element={<ResultadoPage />} />
        <Route path="mapa" element={<MapaPage />} />
        <Route path="importacao" element={<ImportacaoPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
