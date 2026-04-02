// server/routes/users.js
import express from "express";
import pool from "../db.js"; // your PostgreSQL pool

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;