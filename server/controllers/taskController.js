const pool = require("../db");
const { validate: isUuid } = require("uuid");

// DB statuses (match your CHECK constraint)
const STATUS_VALUES = ["pending", "in_progress", "completed"];

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, due_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description || null, "pending", due_date || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
};

// Assign a user to a task
const assignUser = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;

    if (!userId || !isUuid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const userCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [userId]
    );

    if (!userCheck.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET assigned_to = $1
       WHERE id = $2
       RETURNING *`,
      [userId, taskId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign user" });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!STATUS_VALUES.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await pool.query(
      `UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *`,
      [status, taskId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get tasks + Overdue logic + filtering
const getTasks = async (req, res) => {
  try {
    const { status } = req.query;

    const result = await pool.query("SELECT * FROM tasks");

    const now = new Date();

    let tasks = result.rows.map(task => {
      if (
        task.due_date &&
        new Date(task.due_date) < now &&
        task.status !== "completed"
      ) {
        return { ...task, status: "Overdue" };
      }
      return task;
    });

    // filter support
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createTask,
  assignUser,
  updateTaskStatus, // ✅ fixed
  getTasks,
};