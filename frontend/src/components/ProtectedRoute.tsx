import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { state } = useAuth();

  if (state.loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return state.isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
