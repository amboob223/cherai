import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">🍒🔍 Cherai</div>
        <small className="tagline">I see you</small>
      </div>

      <nav className="nav flex-column mt-4">
        <NavLink to="/dashboard" className="nav-link">
          Dashboard
        </NavLink>

        <NavLink to="/incidents" className="nav-link">
          Incidents
        </NavLink>

        <NavLink to="/tasks" className="nav-link">
          Tasks
        </NavLink>

        <NavLink to="/policies" className="nav-link">
          Policies
        </NavLink>

        {user?.role === "admin" && (
          <NavLink to="/admin" className="nav-link text-warning">
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <small>Secure Monitoring System</small>
      </div>
    </div>
  );
}