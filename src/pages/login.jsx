import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

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

      <div className="form-card" style={{ maxWidth: "400px", width: "100%" }}>

        <h1 className="form-title">
          Welcome Back
        </h1>

        <p style={{ color: "#aaa", marginBottom: "20px" }}>
          Sign in to continue to Cherai Security
        </p>

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

      </div>

    </div>
  );
};

export default Login;