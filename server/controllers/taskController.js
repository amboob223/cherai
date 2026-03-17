const pool = require("../db");

// Allowed status values in your DB
const STATUS_VALUES = ["pending", "in_progress", "completed"];

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description || null, "pending"] // must match DB CHECK
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
  
      // Check if user exists
      const userCheck = await pool.query(
        `SELECT id FROM users WHERE id = $1`,
        [userId]
      );
  
      if (!userCheck.rows.length) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Assign task
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

  const { validate: isUuid } = require('uuid');  // <-- add this at the top


// Update task status
const updateStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!STATUS_VALUES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${STATUS_VALUES.join(", ")}` });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, taskId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

// Get tasks, optionally filter by assigned user
const getTasks = async (req, res) => {
  try {
    const { assignedUser } = req.query;
    let result;

    if (assignedUser) {
      result = await pool.query(
        `SELECT * FROM tasks
         WHERE assigned_to = $1
         ORDER BY created_at DESC`,
        [assignedUser]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM tasks
         ORDER BY created_at DESC`
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

module.exports = {
  createTask,
  assignUser,
  updateStatus,
  getTasks,
};