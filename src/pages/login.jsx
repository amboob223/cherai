import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

// 👉 logo import
import logo from "../assests/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const token = res.data.token;
      const user = res.data.user;

      if (!token) {
        alert("No token returned from server");
        return;
      }

      login(user, token);
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page-center">

      <div className="form-card" style={{ maxWidth: "420px", width: "100%" }}>

        {/* =========================
            LOGO HEADER
        ========================= */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "10px"
        }}>
          <img
            src={logo}
            alt="CherAI Logo"
            style={{ width: "45px", height: "45px", objectFit: "contain" }}
          />
        </div>

        <h1 className="form-title" style={{ textAlign: "center" }}>
          Welcome Back
        </h1>

        <p style={{ color: "#aaa", marginBottom: "20px", textAlign: "center" }}>
          Sign in to access CherAI Security Platform
        </p>

        {/* =========================
            FORM
        ========================= */}
        <form onSubmit={handleSubmit}>

          <div style={{ display: "grid", gap: "12px" }}>

            <input
              className="form-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="form-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="form-btn" type="submit">
              Login
            </button>

          </div>

        </form>

        {/* =========================
            REGISTER LINK
        ========================= */}
        <p style={{
          marginTop: "15px",
          color: "#aaa",
          fontSize: "14px",
          textAlign: "center"
        }}>
          Don’t have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#ff4d6d",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Create one
          </Link>
        </p>

      </div>

    </div>
  );
};

export default Login;