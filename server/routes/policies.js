const express = require("express");
const router = express.Router();
const pool = require("../db");
const { protect } = require("../middleware/authMiddleware");

// =========================
// GET POLICIES (UUID SAFE)
// =========================
router.get("/", protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM policies
       WHERE created_by = $1::uuid
       ORDER BY id DESC`,
      [req.user.id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("GET POLICIES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// CREATE POLICY (UUID SAFE)
// =========================
router.post("/", protect, async (req, res) => {
  const { title, description } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO policies (title, description, created_by)
       VALUES ($1, $2, $3::uuid)
       RETURNING *`,
      [title, description, req.user.id]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("CREATE POLICY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;