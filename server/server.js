const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 5000;

// ✅ ONE consistent secret
const SECRET = process.env.JWT_SECRET || "devsecret";

// ✅ Import middleware correctly
const { protect, authorize } = require("./middleware/authMiddleware");

console.log("DEBUG:", protect, authorize);

// =========================
// MIDDLEWARE
// =========================
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// const incidentsRoutes = require("./routes/incidents");

app.use("/api/incidents", require("./routes/incidents"));






// =========================
// ROUTES (EXTERNAL)
// =========================
const tasksRouter = require("./routes/tasks");
const policiesRouter = require("./routes/policies");
// const incidentsRouter = require("./routes/incidents");

// router.get("/", protect, async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 5;
//     const offset = (page - 1) * limit;

//     console.log("USER:", req.user.id, "PAGE:", page);

//     // ✅ Get paginated data
//     const dataQuery = await pool.query(
//       `SELECT * FROM incidents
//        WHERE assigned_to = $1
//        ORDER BY id DESC
//        LIMIT $2 OFFSET $3`,
//       [req.user.id, limit, offset]
//     );

//     // ✅ Get total count (important for pagination)
//     const countQuery = await pool.query(
//       `SELECT COUNT(*) FROM incidents WHERE assigned_to = $1`,
//       [req.user.id]
//     );

//     res.json({
//       data: dataQuery.rows,
//       total: parseInt(countQuery.rows[0].count),
//     });
//   } catch (err) {
//     console.error("GET incidents error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });



// ❌ REMOVED broken router + postgres auth

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
// AUTH ROUTES (ONLY ONE SYSTEM)
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
    role: "user",
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
// CURRENT USER
// =========================
app.get("/api/me", protect, (req, res) => {
  res.json(req.user);
});

// =========================
// INCIDENTS (PROTECTED)
// =========================
// app.get("/api/incidents", protect, (req, res) => {
//   const data = JSON.parse(fs.readFileSync(dataFile));

//   const userIncidents = data.filter(
//     (i) => i.createdBy === req.user.id
//   );

//   res.json(userIncidents);
// });

app.post("/api/incidents", protect, upload.single("file"), (req, res) => {
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
// ADMIN ROUTE
// =========================
app.get("/api/admin/users", protect, authorize("admin"), (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersFile));
  res.json(users);
});

// =========================
// OTHER ROUTES
// =========================
app.use("/api/tasks", tasksRouter);
app.use("/api/policies", policiesRouter);

// =========================
// DEFAULT
// =========================
app.get("/", (req, res) => {
  res.send("Server is running");
});


// =========================
// ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});