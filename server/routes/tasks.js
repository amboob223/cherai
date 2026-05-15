const express = require("express");
const router = express.Router();
const pool = require("../db");

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
      [title, description || null]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ error: err.message });
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
    console.error("GET TASKS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;