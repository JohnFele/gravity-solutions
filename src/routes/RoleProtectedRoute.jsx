import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RoleProtectedRoute = ({ roles, children }) => {
  const { isAuthenticated, user, authReady } = useAuth();

  if (!authReady) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />
  }

  const userRole = String(user?.role || '').toLowerCase();

  const allowedRoles = roles.map(role => String(role).toLowerCase());

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default RoleProtectedRoute