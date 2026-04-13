const express = require("express");
const router = express.Router();
const pool = require("../db");
const { protect } = require("../middleware/authMiddleware");


// =========================
// CREATE TASK
// =========================
router.post("/", protect, async (req, res) => {
  const { title, description, status } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, created_by)
       VALUES ($1, $2, $3,$4)
       RETURNING *`,
       [title, description, status, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});


// =========================
// GET TASKS (filters + search)
// =========================
router.get("/", protect, async (req, res) => {
  try {
    const { search, assigned_to } = req.query;

    let query = "SELECT * FROM tasks WHERE 1=1";
    const values = [];

    // 🔥 FORCE USER SCOPE
    values.push(req.user.id);
    query += ` AND created_by = $${values.length}`;

    if (search) {
      values.push(`%${search}%`);
      query += ` AND title ILIKE $${values.length}`;
    }

    query += " ORDER BY id DESC";

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// UPDATE TASK
// =========================
router.put("/:id", protect, async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  try {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    if (keys.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const setQuery = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    const result = await pool.query(
      `UPDATE tasks
       SET ${setQuery}
       WHERE id = $${keys.length + 1}
       RETURNING *`,
      [...values, id]
    );

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
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;