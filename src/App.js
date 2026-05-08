import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Sidebar from "./components/sidebar";
import ProtectedRoute from "./components/protectedRoute";

import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import Policies from "./pages/policies";
import Tasks from "./pages/Tasks";
import Admin from "./pages/admin";
import Incidents from "./pages/Incidents";

function App() {
  const { user, loading } = useContext(AuthContext);

  // Prevent UI flash before auth resolves
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <Router>
      <div className="app-layout">
        {/* Sidebar only when authenticated */}
        {user && <Sidebar />}

        <div className="main-content">
          <Routes>

            {/* ================= PUBLIC ================= */}
            <Route
              path="/login"
              element={
                user ? <Navigate to="/dashboard" replace /> : <Login />
              }
            />

            <Route
              path="/register"
              element={
                user ? <Navigate to="/dashboard" replace /> : <Register />
              }
            />

            {/* ================= PROTECTED ================= */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />

            <Route
              path="/policies"
              element={
                <ProtectedRoute>
                  <Policies />
                </ProtectedRoute>
              }
            />

            <Route
              path="/incidents"
              element={
                <ProtectedRoute>
                  <Incidents />
                </ProtectedRoute>
              }
            />

            {/* ================= ADMIN ================= */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  {isAdmin ? (
                    <Admin />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )}
                </ProtectedRoute>
              }
            />

            {/* ================= DEFAULT ================= */}
            <Route
              path="/"
              element={
                <Navigate
                  to={user ? "/dashboard" : "/login"}
                  replace
                />
              }
            />

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;