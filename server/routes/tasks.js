const express = require("express");
const router = express.Router();
const pool = require("../db");

// =========================
// CREATE TASK
// =========================
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

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

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ message: "Server error" });
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

    res.json(result.rows);
  } catch (err) {
    console.error("GET TASK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// UPDATE TASK
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

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// DELETE TASK (FIXED - YOUR ISSUE)
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({
      message: "Task deleted successfully",
      task: result.rows[0],
    });

  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;