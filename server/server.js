const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
// MIDDLEWARE
// =========================

// Allowed origins (dev + production)
const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_URL
];

// CORS setup
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman / mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Blocked by CORS: Not allowed"));
  },
  credentials: true
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
app.use("/api/employees", require("./routes/employees"));

// =========================
// HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.json({
    message: "Server running",
    status: "OK"
  });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});