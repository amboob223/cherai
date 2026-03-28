const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE INCIDENT
router.post("/", async (req, res) => {
  const { title, description, severity, assigned_to } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO incidents (title, description, severity, assigned_to) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, severity, assigned_to]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL INCIDENTS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM incidents ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;