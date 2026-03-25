// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div style={styles.sidebar}>
      <h2>Admin Panel</h2>
      <nav>
        <ul style={styles.ul}>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/policies">Policies</Link></li>
          <li><Link to="/tasks">Tasks</Link></li>
        </ul>
      </nav>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "200px",
    height: "100vh",
    background: "#1e1e2f",
    color: "#fff",
    padding: "20px",
    position: "fixed",
  },
  ul: {
    listStyleType: "none",
    padding: 0,
  },
};

export default Sidebar;