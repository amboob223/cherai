const express = require("express");
const router = express.Router();
const pool = require("../db");
const protect = require("../middleware/authMiddleware");

// =========================
// GET POLICIES
// =========================
router.get("/", protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM policies
       WHERE created_by = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET POLICIES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// =========================
// CREATE POLICY
// =========================
router.post("/", protect, async (req, res) => {
  try {
    const { title, description } = req.body;

    const result = await pool.query(
      `INSERT INTO policies (title, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE POLICY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// =========================
// UPDATE POLICY
// =========================
router.put("/:id", protect, async (req, res) => {
  try {
    const { title, description } = req.body;

    const result = await pool.query(
      `UPDATE policies
       SET title = $1, description = $2
       WHERE id = $3 AND created_by = $4
       RETURNING *`,
      [title, description, req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE POLICY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// =========================
// DELETE POLICY
// =========================
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM policies
       WHERE id = $1 AND created_by = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE POLICY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;