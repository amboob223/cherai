const express = require("express");
const router = express.Router();
const pool = require("../db");

// =========================
// GET TASKS
// =========================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// CREATE TASK
// =========================
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const result = await pool.query(
      `
      INSERT INTO tasks (title, description, status, assigned_to)
      VALUES ($1, $2, 'open', NULL)
      RETURNING *
      `,
      [title, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// UPDATE TASK (STATUS + ASSIGN)
// =========================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to } = req.body;

    const result = await pool.query(
      `
      UPDATE tasks
      SET
        status = COALESCE($1, status),
        assigned_to = COALESCE($2, assigned_to)
      WHERE id = $3
      RETURNING *
      `,
      [status || null, assigned_to || null, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// DELETE TASK
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;