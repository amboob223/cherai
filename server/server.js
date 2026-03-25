const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const { getDashboard } = require("./controllers/dashboardController");
const pool = require("./db");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
}));

// No app.options("/*") – REMOVE IT

// Routes
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  const existingUser = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  if (existingUser.rows.length > 0)
    return res.status(400).json({ message: "Email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)",
    [name, email, hashedPassword]
  );

  res.status(201).json({ message: "User created" });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const userResult = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  if (userResult.rows.length === 0)
    return res.status(401).json({ message: "Invalid credentials" });

  const user = userResult.rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 24*60*60*1000,
  });

  res.json({ message: "Logged in successfully" });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production"
  });
  res.json({ message: "Logged out" });
});

// Auth middleware
const protect = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Token invalid" });
  }
};

// Protected routes
app.get("/dashboard", protect, getDashboard);
app.get("/api/me", protect, (req, res) => res.json(req.user));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));