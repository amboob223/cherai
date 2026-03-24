const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Simple in-memory "DB"
const users = [];

// Register
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "All fields required" });

  const exists = users.find(u => u.username === username);
  if (exists) return res.status(400).json({ message: "Username taken" });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  res.status(201).json({ message: "User created" });
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username }, "SUPERSECRET", { expiresIn: "1d" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    sameSite: "Strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ message: "Logged in successfully" });
});

// Middleware to protect routes
const protect = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, "SUPERSECRET");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Token invalid" });
  }
};

app.post("/api/logout", (req, res) => {
  // Clear the httpOnly cookie
  res.clearCookie("token", { httpOnly: true, sameSite: "Strict", secure: false });
  res.json({ message: "Logged out successfully" });
});

// Protected route example
app.get("/api/dashboard", protect, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}!` });
});

app.listen(5000, () => console.log("Server running on port 5000"));