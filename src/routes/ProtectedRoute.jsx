import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) return null;
  
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
