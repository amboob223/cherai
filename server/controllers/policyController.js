const pool = require("../db");
const logAction = require("../helpers/logHelper");

// Helpers
const getDaysUntilReview = (reviewDate) => {
  if (!reviewDate) return null;
  const today = new Date();
  const review = new Date(reviewDate);
  return Math.ceil((review - today) / (1000 * 60 * 60 * 24));
};

const getOverdueStatus = (reviewDate) => {
  const days = getDaysUntilReview(reviewDate);
  return days !== null && days < 0;
};

// GET all
const getPolicies = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM policies ORDER BY created_at DESC");

    const data = result.rows.map((policy) => ({
      ...policy,
      days_until_review: getDaysUntilReview(policy.review_date),
      overdue: getOverdueStatus(policy.review_date),
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET one
const getPolicyById = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM policies WHERE id = $1", [req.params.id]);

    if (!result.rows[0]) {
      return res.status(404).json({ msg: "Policy not found" });
    }

    const policy = result.rows[0];
    policy.days_until_review = getDaysUntilReview(policy.review_date);
    policy.overdue = getOverdueStatus(policy.review_date);

    res.json(policy);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// CREATE
const createPolicy = async (req, res) => {
  try {
    const { title, description, status = "draft" } = req.body;

    const result = await pool.query(
      `INSERT INTO policies (title, description, owner_id, status, review_date, version)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '90 days', 1)
       RETURNING *`,
      [title, description, req.user.userId, status]
    );

    await logAction(req.user.userId, "CREATE_POLICY", "policy", result.rows[0].id);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// UPDATE
const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const existing = await pool.query("SELECT * FROM policies WHERE id=$1", [id]);
    if (!existing.rows[0]) return res.status(404).json({ msg: "Not found" });

    const policy = existing.rows[0];

    if (req.user.role !== "admin" && req.user.userId !== policy.owner_id) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    const updated = await pool.query(
      `UPDATE policies SET title=$1, description=$2, version = version + 1 WHERE id=$3 RETURNING *`,
      [title, description, id]
    );

    await logAction(req.user.userId, "UPDATE_POLICY", "policy", id);

    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE
const deletePolicy = async (req, res) => {
  try {
    await pool.query("DELETE FROM policies WHERE id = $1", [req.params.id]);

    await logAction(req.user.userId, "DELETE_POLICY", "policy", req.params.id);

    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


const attachDocumentToPolicy = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE policies SET document_path = $1 WHERE id = $2 RETURNING *",
      [filePath, id]
    );

    res.json({
      message: "File uploaded and saved",
      policy: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ FILE UPLOAD HANDLER


// ✅ EXPORT EVERYTHING ONCE
module.exports = {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  attachDocumentToPolicy,
};