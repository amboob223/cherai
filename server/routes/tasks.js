const express = require("express");
const router = express.Router();
const pool = require("../db");
const protect = require("../middleware/authMiddleware");

const validStatuses = ["pending", "in_progress", "done"];

const allowedUpdateFields = [
  "title",
  "description",
  "status",
  "assigned_to",
  "due_date",
];

// =========================
// CREATE TASK
// =========================
router.post("/", protect, async (req, res) => {
  try {
    let { title, description, status, assigned_to } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!validStatuses.includes(status)) {
      status = "pending";
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, created_by, assigned_to)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        title,
        description || "",
        status,
        req.user.id,
        assigned_to || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// =========================
// GET TASKS
// =========================
router.get("/", protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tasks
       WHERE created_by = $1
       ORDER BY id DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// UPDATE TASK
// =========================
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const fields = {};

    for (const key of Object.keys(req.body)) {
      if (allowedUpdateFields.includes(key)) {
        fields[key] = req.body[key];
      }
    }

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: "No valid fields" });
    }

    if (
      fields.status &&
      !validStatuses.includes(fields.status)
    ) {
      fields.status = "pending";
    }

    const keys = Object.keys(fields);
    const values = Object.values(fields);

    const setQuery = keys
      .map((k, i) => `${k} = $${i + 1}`)
      .join(", ");

    const result = await pool.query(
      `UPDATE tasks
       SET ${setQuery}
       WHERE id = $${keys.length + 1}
       RETURNING *`,
      [...values, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// =========================
// DELETE TASK
// =========================
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;