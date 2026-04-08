const express = require("express");
const router = express.Router();
const pool = require("../db");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 5;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM incidents WHERE user_id = $1",
      [userId]
    );
    const total = parseInt(totalResult.rows[0].count);

    const incidentsResult = await pool.query(
      "SELECT id, title, description, created_at FROM incidents WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [userId, limit, offset]
    );

    res.json({
      data: incidentsResult.rows,
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;