const express = require("express");
const router = express.Router();
const pool = require("../db");
const { protect } = require("../middleware/authMiddleware");

// =========================
// GET TASKS (with optional filters)
// =========================




router.get("/", async (req, res) => {
  try {
    const { search, assigned_to } = req.query;

    let query = "SELECT * FROM tasks WHERE 1=1";
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      query += ` AND title ILIKE $${values.length}`;
    }

    if (assigned_to) {
      values.push(assigned_to);
      query += ` AND assigned_to = $${values.length}`;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});



// =========================
// UPDATE TASK
// =========================
router.put("/:id", async (req, res) => {
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
      `UPDATE tasks SET ${setQuery} WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

module.exports = router;