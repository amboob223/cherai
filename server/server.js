const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ROUTES
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const policyRoutes = require("./routes/policies");

// Make sure this is exactly like this:
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/policies", policyRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("ComplianceOS backend is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});