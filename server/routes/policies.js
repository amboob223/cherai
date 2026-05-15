const express = require("express");
const router = express.Router();
const pool = require("../db");

// =========================
// GET POLICIES
// =========================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM policies ORDER BY id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET POLICIES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch policies" });
  }
});

// =========================
// CREATE POLICY
// =========================
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await pool.query(
      `INSERT INTO policies (title, description)
       VALUES ($1, $2)
       RETURNING *`,
      [title, description || ""]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("CREATE POLICY ERROR:", err);
    res.status(500).json({ error: "Failed to create policy" });
  }
});

// =========================
// DELETE POLICY
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM policies WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Policy not found" });
    }

    res.json({ message: "Policy deleted" });

  } catch (err) {
    console.error("DELETE POLICY ERROR:", err);
    res.status(500).json({ error: "Failed to delete policy" });
  }
});

module.exports = router;