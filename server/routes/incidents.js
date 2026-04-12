const express = require("express");
const router = express.Router();
const pool = require("../db");
const { protect } = require("../middleware/authMiddleware");

// GET incidents
router.get("/", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    console.log("USER:", req.user.id, "PAGE:", page);

    // ✅ Get paginated data
    const dataQuery = await pool.query(
      `SELECT * FROM incidents
       WHERE assigned_to = $1
       ORDER BY id DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    // ✅ Get total count (important for pagination)
    const countQuery = await pool.query(
      `SELECT COUNT(*) FROM incidents WHERE assigned_to = $1`,
      [req.user.id]
    );

    res.json({
      data: dataQuery.rows,
      total: parseInt(countQuery.rows[0].count),
    });
  } catch (err) {
    console.error("GET incidents error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE incident
router.post("/", protect, async (req, res) => {
  const { title, description, severity } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO incidents (title, description, severity, status, assigned_to)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, severity, "pending", req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST incident error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//delete 
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM incidents
       WHERE id = $1 AND assigned_to = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.json({ message: "Incident deleted successfully" });
  } catch (err) {
    console.error("DELETE error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;