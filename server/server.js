const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
// MIDDLEWARE
// =========================
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

// =========================
// ROUTES
// =========================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/policies", require("./routes/policies"));
app.use("/api/incidents", require("./routes/incidents"));

// ✅ EMPLOYEES ROUTE (IMPORTANT)
app.use("/api/employees", require("./routes/employees"));

// =========================
// HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.json({ message: "Server running" });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});