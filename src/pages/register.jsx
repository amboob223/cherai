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

  // ✅ Production backend URL
  const API_URL = "https://cherai-kosc.onrender.com";

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // ✅ Basic validation
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    try {
      // ✅ FIXED API URL
      const res = await axios.post(
        `${API_URL}/api/auth/register`,
        form,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ Save token if returned
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // ✅ Redirect
      navigate("/dashboard");

    } catch (err) {
      console.error("REGISTER ERROR:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed"
      );
    }
  };

  return (
    <div className="page-center">

      <div
        className="form-card"
        style={{
          maxWidth: "420px",
          width: "100%",
        }}
      >

        {/* =========================
            LOGO
        ========================= */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <img
            src={logo}
            alt="CherAI Logo"
            style={{
              width: "175px",
              height: "175px",
              objectFit: "contain",
            }}
          />
        </div>

        <h1
          className="form-title"
          style={{ textAlign: "center" }}
        >
          Create Account
        </h1>

        <p
          style={{
            color: "#aaa",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          Join CherAI Security Platform
        </p>

        {/* =========================
            FORM
        ========================= */}
        <form onSubmit={handleSubmit} autoComplete="on">

          <div style={{ display: "grid", gap: "12px" }}>

            {/* NAME */}
            <input
              className="form-input"
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
            />

            {/* EMAIL */}
            <input
              className="form-input"
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            {/* PASSWORD */}
            <input
              className="form-input"
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />

            {/* ERROR */}
            {error && (
              <p
                style={{
                  color: "#ff8fab",
                  fontSize: "14px",
                }}
              >
                {error}
              </p>
            )}

            {/* SUBMIT */}
            <button
              className="form-btn"
              type="submit"
            >
              Register
            </button>

          </div>

        </form>

        {/* =========================
            LOGIN LINK
        ========================= */}
        <p
          style={{
            marginTop: "15px",
            color: "#aaa",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#ff4d6d",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Sign in
          </Link>
        </p>

      </div>

    </div>
  );
}