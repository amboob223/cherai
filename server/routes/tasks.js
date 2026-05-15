const express = require("express");
const router = express.Router();
const pool = require("../db");

// =========================
// CREATE TASK
// =========================
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    console.log("CREATE TASK BODY:", req.body);

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const result = await pool.query(
      `
      INSERT INTO tasks (title, description, status)
      VALUES ($1, $2, 'open')
      RETURNING *
      `,
      [title.trim(), description || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    return res.status(500).json({ message: "Server error creating task" });
  }
});

// =========================
// GET TASKS
// =========================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tasks ORDER BY created_at DESC`
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    return res.status(500).json({ message: "Server error fetching tasks" });
  }
});

// =========================
// UPDATE TASK (FIXED)
// =========================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const result = await pool.query(
      `
      UPDATE tasks
      SET title = $1,
          description = $2,
          status = $3
      WHERE id = $4
      RETURNING *
      `,
      [title, description, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    return res.status(500).json({ message: "Server error updating task" });
  }
});

module.exports = router;