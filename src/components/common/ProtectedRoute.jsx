import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');

  // No token → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Admin guard
  if (adminOnly) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
