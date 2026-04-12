import { Link } from "react-router-dom";

const Navbar = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav style={{ padding: "10px", background: "#eee" }}>
      <Link to="/dashboard" style={{ marginRight: "10px" }}>
        Dashboard
      </Link>

      <Link to="/incidents" style={{ marginRight: "10px" }}>
        Incidents
      </Link>

      <Link to="/tasks">
        Tasks
      </Link>

      <button onClick={handleLogout}>
  Logout
</button>
    </nav>

  );
};

export default Navbar;