const express = require("express");
const router = express.Router();
const pool = require("../db");

// =========================
// GET TASKS
// =========================
router.get("/", async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT *
      FROM tasks
      ORDER BY created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {

    console.error("GET TASKS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });

  }
});

// =========================
// CREATE TASK
// =========================
router.post("/", async (req, res) => {
  try {

    const {
      title,
      description,
      assigned_to,
      status
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO tasks (
        title,
        description,
        assigned_to,
        status
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        title,
        description || "",
        assigned_to || null,
        status || "pending"
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {

    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ error: "Failed to create task" });

  }
});

// =========================
// UPDATE TASK
// =========================
router.put("/:id", async (req, res) => {
  try {

    const { id } = req.params;

    const {
      assigned_to,
      status
    } = req.body;

    const result = await pool.query(
      `
      UPDATE tasks
      SET
        assigned_to = $1,
        status = $2
      WHERE id = $3
      RETURNING *
      `,
      [
        assigned_to || null,
        status || "pending",
        id
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error("UPDATE TASK ERROR:", err);
    res.status(500).json({ error: "Failed to update task" });

  }
});

// =========================
// DELETE TASK
// =========================
router.delete("/:id", async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM tasks
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Task deleted"
    });

  } catch (err) {

    console.error("DELETE TASK ERROR:", err);
    res.status(500).json({ error: "Failed to delete task" });

  }
});

module.exports = router;