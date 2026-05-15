const express = require("express");
const router = express.Router();
const pool = require("../db");

// =========================
// CREATE EMPLOYEE
// =========================
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const result = await pool.query(
      `
      INSERT INTO users (name, email, role)
      VALUES ($1, $2, 'employee')
      RETURNING id, name, email, role
      `,
      [name, email || null]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("CREATE EMPLOYEE ERROR:", err);
    res.status(500).json({ error: "Server error" });
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
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;