const express = require("express");
const router = express.Router();
const pool = require("../db");

// =========================
// GET INCIDENTS
// =========================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM incidents ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET INCIDENTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// CREATE INCIDENT (supports optional upload field)
// =========================
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      severity,
      file_url, // 👈 for upload support (S3 / Cloudinary / local later)
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const result = await pool.query(
      `
      INSERT INTO incidents (
        title,
        description,
        severity,
        file_url,
        status,
        created_at
      )
      VALUES ($1, $2, $3, $4, 'open', NOW())
      RETURNING *
      `,
      [
        title,
        description || null,
        severity || "low",
        file_url || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE INCIDENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// UPDATE INCIDENT STATUS
// =========================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `
      UPDATE incidents
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE INCIDENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// DELETE INCIDENT
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM incidents WHERE id = $1", [id]);

    res.json({ message: "Incident deleted" });
  } catch (err) {
    console.error("DELETE INCIDENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;