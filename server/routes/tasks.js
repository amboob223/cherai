const express = require("express");
const router = express.Router();
const pool = require("../db");

// =========================
// GET TASKS
// =========================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM tasks
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// =========================
// CREATE TASK
// =========================
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await pool.query(
      `
      INSERT INTO tasks (title, description, status)
      VALUES ($1, $2, 'open')
      RETURNING *
      `,
      [title, description || ""]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// =========================
// UPDATE TASK (STATUS + ASSIGNMENT)
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
      [status, assigned_to, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// =========================
// DELETE TASK
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;