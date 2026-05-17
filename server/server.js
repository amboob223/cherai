const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
// CORS
// =========================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://thecherai.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true,
  })
);

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
    status: "OK",
  });
});

// =========================
// UPLOADS (FIXED FOR RENDER)
// =========================
const uploadPath = path.join(__dirname, "uploads");

// ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// serve uploads publicly
app.use("/uploads", express.static(uploadPath));

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🌍 Allowed origins:", allowedOrigins);
});