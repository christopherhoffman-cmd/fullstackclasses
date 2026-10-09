import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/AuthProvider';

export default function ProtectedRoute({ children }) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  return children;
}
