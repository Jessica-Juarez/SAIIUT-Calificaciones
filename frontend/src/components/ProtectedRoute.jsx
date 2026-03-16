import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  // Obtenemos el usuario guardado en el login
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // 1. Si no hay token o usuario, patada al Login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si hay roles definidos y el usuario no tiene el correcto, patada al inicio
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    alert("Acceso denegado: No tienes permisos para ver esto.");
    return <Navigate to="/" replace />; // O a una página de "Unauthorized"
  }

  // 3. Si todo está bien, renderiza la ruta hija (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;