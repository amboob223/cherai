const pool = require("../db");
const logAction = require("../helpers/logHelper");

// =========================
// GET POLICIES
// =========================
const getPolicies = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM policies
       WHERE created_by = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET POLICIES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// =========================
// CREATE POLICY
// =========================
const createPolicy = async (req, res) => {
  try {
    const { title, description } = req.body;

    const result = await pool.query(
      `INSERT INTO policies (title, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, req.user.id]
    );

    await logAction(
      req.user.id,
      "CREATE_POLICY",
      "policy",
      result.rows[0].id
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE POLICY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// =========================
// GET SINGLE POLICY
// =========================
const getPolicyById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM policies WHERE id = $1`,
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// UPDATE POLICY
// =========================
const updatePolicy = async (req, res) => {
  try {
    const { title, description } = req.body;

    const result = await pool.query(
      `UPDATE policies
       SET title = $1, description = $2
       WHERE id = $3 AND created_by = $4
       RETURNING *`,
      [title, description, req.params.id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Policy not found or unauthorized" });
    }

    await logAction(
      req.user.id,
      "UPDATE_POLICY",
      "policy",
      req.params.id
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// DELETE POLICY
// =========================
const deletePolicy = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM policies
       WHERE id = $1 AND created_by = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        message: "Policy not found or unauthorized",
      });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
};