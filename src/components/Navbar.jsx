import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// 👉 import logo
import logo from "../assests/logo.png";

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* =========================
          BRAND SECTION
      ========================= */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

        {/* Logo still goes to dashboard */}
        <Link
          to="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none"
          }}
        >

          <img
            src={logo}
            alt="CherAI Logo"
            style={{
              width: "172px",
              height: "172px",
              objectFit: "contain"
            }}
          />

          <span
            className="logo"
            style={{
              color: "#ff4d6d",
              fontWeight: "bold"
            }}
          >
            CherAI
          </span>

        </Link>

      </div>

      {/* =========================
          NAV LINKS
      ========================= */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          alignItems: "center"
        }}
      >

        {/* Dashboard link removed */}

        <Link to="/incidents" className="nav-link">
          Incidents
        </Link>

        <Link to="/tasks" className="nav-link">
          Tasks
        </Link>

        <Link to="/policies" className="nav-link">
          Policies
        </Link>

      </div>

      {/* =========================
          LOGOUT
      ========================= */}
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>

    </nav>
  );
};

export default Navbar;