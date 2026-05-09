import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">

      <Link to="/dashboard" className="logo">
        🍒 CherAI
      </Link>

      <Link to="/dashboard" className="nav-link">
        Dashboard
      </Link>

      <Link to="/incidents" className="nav-link">
        Incidents
      </Link>

      <Link to="/tasks" className="nav-link">
        Tasks
      </Link>

      <Link to="/policies" className="nav-link">
        Policies
      </Link>

      <button
        onClick={handleLogout}
        className="logout-btn"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;