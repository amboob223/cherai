const express = require("express");
const router = express.Router();
const pool = require("../db");

// =========================
// GET POLICIES
// =========================
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;

    let query = "SELECT * FROM policies WHERE 1=1";
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      query += ` AND title ILIKE $${values.length}`;
    }

    query += " ORDER BY title ASC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("GET POLICIES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch policies" });
  }
});

module.exports = router;