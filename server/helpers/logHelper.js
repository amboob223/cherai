// helpers/logHelper.js
const pool = require("../db");

const logAction = async (userId, action, entity, entityId) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [userId, action, entity, entityId]
    );
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
};

module.exports = logAction;