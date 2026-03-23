const pool = require("../db");

const getDashboard = async (req, res) => {
  try {
    // Total policies
    const totalPolicies = await pool.query(
      "SELECT COUNT(*) FROM policies"
    );

    // Overdue policies (review_date passed)
    const overduePolicies = await pool.query(
      `SELECT COUNT(*) FROM policies
       WHERE review_date IS NOT NULL
       AND review_date < NOW()`
    );

    // Open tasks (not completed)
    const openTasks = await pool.query(
      `SELECT COUNT(*) FROM tasks
       WHERE status != 'Completed' OR status IS NULL`
    );

    // Overdue tasks
    const overdueTasks = await pool.query(
      `SELECT COUNT(*) FROM tasks
       WHERE due_date < NOW()
       AND status != 'Completed'`
    );

    // Recent audit logs (last 10)
    const recentLogs = await pool.query(
      `SELECT * FROM audit_logs
       ORDER BY created_at DESC
       LIMIT 10`
    );

    res.json({
      total_policies: parseInt(totalPolicies.rows[0].count),
      overdue_policies: parseInt(overduePolicies.rows[0].count),
      open_tasks: parseInt(openTasks.rows[0].count),
      overdue_tasks: parseInt(overdueTasks.rows[0].count),
      recent_logs: recentLogs.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getDashboard };