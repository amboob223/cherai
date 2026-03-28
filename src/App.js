// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // added Navigate
import ProtectedRoute from "./components/protectedRoute";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import Policies from "./pages/policies";
import Tasks from "./pages/Tasks";
import Admin from "./pages/admin";
import Incidents from "./pages/incidents";
import Navbar from "./components/Navbar";


function App() {
  const user = JSON.parse(localStorage.getItem("user")); // or use context
  const isAdmin = user?.role === "admin";

  return (
    <Router>
        <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/incidents" element={<Incidents />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            isAdmin ? (
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" />
            )
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
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App; 