const pool = require("../db");

const getDashboard = async (req, res) => {
  try {
    // Total policies
    const totalPolicies = await pool.query(
      "SELECT COUNT(*) FROM policies"
    );

    const upcomingPolicies = await pool.query(`
      SELECT * FROM policies
      WHERE review_date > NOW()
      ORDER BY review_date ASC
      LIMIT 5
    `);

    // Overdue policies
    const overduePolicies = await pool.query(
      `SELECT COUNT(*) FROM policies
       WHERE review_date IS NOT NULL
       AND review_date < NOW()`
    );

    // Open tasks
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

    // Recent audit logs
    const recentLogs = await pool.query(
      `SELECT * FROM audit_logs
       ORDER BY created_at DESC
       LIMIT 10`
    );

    res.json({
      totalPolicies: parseInt(totalPolicies.rows[0].count),
      overduePolicies: parseInt(overduePolicies.rows[0].count),
      openTasks: parseInt(openTasks.rows[0].count),
      overdueTasks: parseInt(overdueTasks.rows[0].count),
      upcomingPolicies: upcomingPolicies.rows,
      recentLogs: recentLogs.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
//   <ul>
//   {data.upcomingPolicies.map(policy => (
//     <li key={policy.id}>
//       {policy.name} - {new Date(policy.review_date).toLocaleDateString()}
//     </li>
//   ))}
// </ul>
};

module.exports = { getDashboard };