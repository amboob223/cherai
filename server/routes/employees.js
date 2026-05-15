const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");

// =========================
// CREATE EMPLOYEE
// =========================
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // 🔑 required because DB enforces NOT NULL
    const hashedPassword = await bcrypt.hash("employee123", 10);

    const result = await pool.query(
      `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, 'employee')
      RETURNING id, name, email, role
      `,
      [name, email || null, hashedPassword]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("CREATE EMPLOYEE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// GET EMPLOYEES
// =========================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, email, role
      FROM users
      WHERE role = 'employee'
      ORDER BY id DESC
      `
    );

    res.json(result.rows);

  } catch (err) {
    console.error("GET EMPLOYEES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;