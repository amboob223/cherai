import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// 👉 logo import
import logo from "../assests/logo.png";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError("All fields required");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Error registering");
    }
  };

  return (
    <div className="page-center">

      <div className="form-card" style={{ maxWidth: "420px", width: "100%" }}>

        {/* =========================
            LOGO
        ========================= */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "10px"
        }}>
          <img
            src={logo}
            alt="CherAI Logo"
            style={{ width: "175px", height: "175px", objectFit: "contain" }}
          />
        </div>

        <h1 className="form-title" style={{ textAlign: "center" }}>
          Create Account
        </h1>

        <p style={{ color: "#aaa", marginBottom: "20px", textAlign: "center" }}>
          Join CherAI Security Platform
        </p>

        {/* =========================
            FORM
        ========================= */}
        <form onSubmit={handleSubmit}>

          <div style={{ display: "grid", gap: "12px" }}>

            <input
              className="form-input"
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
            />

            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />

            {error && (
              <p style={{ color: "#ff8fab", fontSize: "14px" }}>
                {error}
              </p>
            )}

            <button className="form-btn" type="submit">
              Register
            </button>

          </div>

        </form>

        {/* =========================
            LOGIN LINK
        ========================= */}
        <p style={{
          marginTop: "15px",
          color: "#aaa",
          fontSize: "14px",
          textAlign: "center"
        }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#ff4d6d",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Sign in
          </Link>
        </p>

      </div>

    </div>
  );
}