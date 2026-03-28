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



const incidentRoutes = require("./routes/incidents");

app.use("/api/incidents", incidentRoutes);


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



app.get("/api/users", protect, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
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



app.get("/api/tasks", protect, async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks");
  res.json(result.rows);
});

app.put("/api/tasks/:id", protect, async (req, res) => {
  const { id } = req.params;
  const { assigned_to, status } = req.body;

  try {
    // Get current task values
    const current = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);

    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const existingTask = current.rows[0];

    // Use new value OR fallback to existing
    const newAssigned = assigned_to ?? existingTask.assigned_to;
    const newStatus = status ?? existingTask.status;

    await pool.query(
      "UPDATE tasks SET assigned_to=$1, status=$2 WHERE id=$3",
      [newAssigned, newStatus, id]
    );

    res.json({ message: "Task updated" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected routes
app.get("/dashboard", protect, getDashboard);
app.get("/api/me", protect, (req, res) => res.json(req.user));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));