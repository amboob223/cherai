// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, auth }) {
  return auth ? children : <Navigate to="/login" />;
}