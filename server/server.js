const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = require("express").Router(); // ⚠ must define router
const { protect, authorize } = require("./middleware/authMiddleware");
console.log("DEBUG:", protect, authorize);
const app = express();
const PORT = 5000;
const SECRET = "secretkey";



// ===========================
// REGISTER
// ===========================
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    // 1️⃣ Check if user exists
    const userCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (userCheck.rows.length > 0)
      return res.status(400).json({ message: "User already exists" });

    // 2️⃣ Hash password
    const salt = await bcrypt.genSalt(12); // 10–12 rounds recommended
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3️⃣ Insert user into DB
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );

    const user = result.rows[0];

    // 4️⃣ Generate JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================
// LOGIN
// ===========================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    // 1️⃣ Find user by email
    const result = await pool.query(
      "SELECT id, email, password FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // 3️⃣ Generate JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


const dotenv = require("dotenv");
const incidentsRouter = require("./routes/incidents");
const authRouter = require("./routes/auth"); // if you have login/register routes

dotenv.config();


// Middlewares
app.use(cors());
app.use(express.json()); // parse JSON bodies

// Routes
app.use("/api/incidents", incidentsRouter);
app.use("/api/auth", authRouter); // optional: login/register

// Default route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});




















// =========================
// MIDDLEWARE
// =========================
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/incidents", router);

// =========================
// FILE SETUP
// =========================
const ensureFile = (filePath, defaultData = "[]") => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, defaultData);
};

const dataFile = path.join(__dirname, "data", "incidents.json");
const usersFile = path.join(__dirname, "data", "users.json");



ensureFile(dataFile);
ensureFile(usersFile);

// =========================
// MULTER
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// =========================
// AUTH ROUTES
// =========================



// REGISTER
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  const users = JSON.parse(fs.readFileSync(usersFile));

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "User exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    name,
    email,
    password: hashedPassword,
    role: "user", // ✅ default role
  };

  users.push(newUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token, user: newUser });
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const users = JSON.parse(fs.readFileSync(usersFile));
  const user = users.find((u) => u.email === email);

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

// =========================
// INCIDENTS (MULTI-TENANT)
// =========================

// GET ONLY USER'S INCIDENTS
app.get("/incidents", protect, (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataFile));

  const userIncidents = data.filter(
    (i) => i.createdBy === req.user.id
  );

  res.json(userIncidents);
});

// CREATE INCIDENT
app.post("/incidents", protect, upload.single("file"), (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataFile));

  const newIncident = {
    id: data.length ? data[data.length - 1].id + 1 : 1,
    title: req.body.title,
    description: req.body.description,
    severity: req.body.severity,
    status: "pending",
    file: req.file ? req.file.filename : null,
    createdBy: req.user.id,
  };

  data.push(newIncident);
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

  res.status(201).json(newIncident);
});

// =========================
// ADMIN ONLY ROUTE
// =========================
app.get("/admin/users", protect, authorize("admin"), (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersFile));
  res.json(users);
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});