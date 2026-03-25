import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/me", {
      withCredentials: true
    })
    .then(() => setIsAuth(true))
    .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) return <p>Loading...</p>;

  return isAuth ? children : <Navigate to="/login" />;
}