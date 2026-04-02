// server/models/Incident.js
const pool = require("../db");

class Incident {
  static async getAll() {
    const res = await pool.query("SELECT * FROM incidents ORDER BY id DESC");
    return res.rows;
  }

  static async create({ title, description, severity }) {
    const res = await pool.query(
      "INSERT INTO incidents (title, description, severity) VALUES ($1, $2, $3) RETURNING *",
      [title, description, severity]
    );
    return res.rows[0];
  }
}

module.exports = Incident;