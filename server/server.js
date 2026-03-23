// server/server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Rate limiting (apply EARLY)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: "Too many requests, try again later."
  }
});
app.use(limiter);

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const policyRoutes = require("./routes/policies");
const tasksRoutes = require("./routes/tasks");
const dashboardRoutes = require("./routes/dashboard");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tasks", tasksRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("ComplianceOS backend is running!");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});