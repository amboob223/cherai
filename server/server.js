const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const app = express();
const PORT = 5000;

// ✅ CORS (MUST be at the top)



app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ✅ Body parser
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ File path
const dataFile = path.join(__dirname, "data", "incidents.json");

// ✅ Ensure file exists (prevents crash)
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, "[]");
}



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});



const upload = multer({ storage });

// =========================
// ROUTES
// =========================
// ✅ Test route (auth placeholder)
app.get("/api/me", (req, res) => {
  res.json({
    id: 1,
    name: "Test User",
    email: "test@example.com",
  });
});

const tasksFile = path.join(__dirname, "data", "tasks.json");
const usersFile = path.join(__dirname, "data", "users.json");

// Ensure files exist
if (!fs.existsSync(tasksFile)) fs.writeFileSync(tasksFile, "[]");
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, "[]");



// GET tasks
app.get("/api/tasks", (req, res) => {
  const tasks = JSON.parse(fs.readFileSync(tasksFile, "utf8"));
  res.json(tasks);
});

// UPDATE task
app.put("/api/tasks/:id", (req, res) => {
  const tasks = JSON.parse(fs.readFileSync(tasksFile, "utf8"));
  const id = parseInt(req.params.id);

  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks[index] = { ...tasks[index], ...req.body };

  fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));

  res.json(tasks[index]);
});

// ✅ GET all incidents
app.get("/api/incidents", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read incidents" });
  }
});





// ✅ CREATE incident
app.post("/api/incidents", upload.single("file"), (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));

    const { title, description, severity } = req.body;

    const newIncident = {
      id: data.length ? data[data.length - 1].id + 1 : 1,
      title,
      description,
      severity,
      status: "pending",
      file: req.file ? req.file.filename : null,
    };

    data.push(newIncident);
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

    res.status(201).json(newIncident);
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});