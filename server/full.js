// =========================
// 📁 PROJECT STRUCTURE
// =========================
// server/
// ├── controllers/
// │   ├── authController.js
// │   ├── incidentController.js
// ├── middleware/
// │   ├── authMiddleware.js
// ├── routes/
// │   ├── authRoutes.js
// │   ├── incidentRoutes.js
// ├── utils/
// │   ├── fileDb.js
// ├── data/
// │   ├── users.json
// │   ├── incidents.json
// ├── uploads/
// ├── .env
// ├── server.js

// =========================
// 🔐 server.js (ENTRY POINT)
// =========================
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const incidentRoutes = require("./routes/incidentRoutes");

const { errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);

app.get("/api/me", require("./middleware/authMiddleware").protect, (req, res) => {
  res.json(req.user);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));

// =========================
// 🔐 middleware/authMiddleware.js
// =========================
const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

// =========================
// 🧠 controllers/authController.js
// =========================
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { readData, writeData } = require("../utils/fileDb");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const users = readData("users.json");

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: "User exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashedPassword,
    role: "user",
  };

  users.push(newUser);
  writeData("users.json", users);

  const token = jwt.sign(newUser, process.env.JWT_SECRET, { expiresIn: "8h" });

  res.json({ token, user: newUser });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const users = readData("users.json");
  const user = users.find(u => u.email === email);

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "8h" });

  res.json({ token, user });
};

// =========================
// 📦 controllers/incidentController.js
// =========================
const { readData, writeData } = require("../utils/fileDb");

exports.getIncidents = (req, res) => {
  const data = readData("incidents.json");
  const userIncidents = data.filter(i => i.createdBy === req.user.id);
  res.json(userIncidents);
};

exports.createIncident = (req, res) => {
  const data = readData("incidents.json");

  const newIncident = {
    id: Date.now(),
    title: req.body.title,
    description: req.body.description,
    severity: req.body.severity,
    status: "pending",
    file: req.file ? req.file.filename : null,
    createdBy: req.user.id,
  };

  data.push(newIncident);
  writeData("incidents.json", data);

  res.status(201).json(newIncident);
};

// =========================
// 🛣 routes/authRoutes.js
// =========================
const router = require("express").Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

module.exports = router;

// =========================
// 🛣 routes/incidentRoutes.js
// =========================
const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const { getIncidents, createIncident } = require("../controllers/incidentController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

router.get("/", protect, getIncidents);
router.post("/", protect, upload.single("file"), createIncident);

module.exports = router;

// =========================
// 🧰 utils/fileDb.js
// =========================
const fs = require("fs");
const path = require("path");

const base = path.join(__dirname, "..", "data");

exports.readData = (file) => {
  const filePath = path.join(base, file);
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]");
  return JSON.parse(fs.readFileSync(filePath));
};

exports.writeData = (file, data) => {
  const filePath = path.join(base, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// =========================
// ⚠️ middleware/errorMiddleware.js
// =========================
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
};
