const pool = require("../db");

async function logAction(userId, action, entityType, entityId) {
  try {
    const result = await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, action, entityType, entityId]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

module.exports = logAction;