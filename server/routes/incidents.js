const express = require("express");
const router = express.Router();
const pool = require("../db");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");

// =========================
// MULTER SETUP
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// =========================
// GET INCIDENTS
// =========================
router.get("/", protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM incidents
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET incidents error:", err);
    res.status(500).json({ message: err.message });
  }
});

// =========================
// CREATE INCIDENT
// =========================
router.post(
  "/",
  protect,
  upload.single("attachment"),
  async (req, res) => {
    try {
      const { title, description, severity } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          message: "Title and description are required",
        });
      }

      const file = req.file;

      const result = await pool.query(
        `INSERT INTO incidents
        (title, description, severity, attachment, user_id, created_by)
        VALUES ($1, $2, $3, $4, $5, $5)
        RETURNING *`,
        [
          title,
          description,
          severity || "low",
          file ? file.filename : null,
          req.user.id,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("CREATE incident error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// =========================
// DELETE INCIDENT
// =========================
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM incidents
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Incident not found",
      });
    }

    res.json({ message: "Incident deleted" });
  } catch (err) {
    console.error("DELETE incident error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;