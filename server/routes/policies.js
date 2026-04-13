const express = require("express");
const router = express.Router();
const pool = require("../db");
const { protect } = require("../middleware/authMiddleware");
// =========================
// GET POLICIES
// =========================
router.get("/", protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM policies
       WHERE created_by = $1
       ORDER BY id DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET POLICIES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch policies" });
  }
});

router.post("/", protect, async (req, res) => {
  const { title, description } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO policies (title, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE POLICY ERROR:", err);
    res.status(500).json({ error: "Failed to create policy" });
  }
});

module.exports = router;