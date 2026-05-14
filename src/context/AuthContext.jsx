import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOGIN FUNCTION
  // =========================
  const login = (userData, token) => {

    setUser(userData);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

  };

  // =========================
  // LOGOUT FUNCTION
  // =========================
  const logout = () => {

    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

  };

  // =========================
  // LOAD USER ON REFRESH
  // =========================
  useEffect(() => {

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);

  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );

};