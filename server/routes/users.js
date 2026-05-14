const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

// GET EMPLOYEES FOR CURRENT BUSINESS
router.get("/", authMiddleware, async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT id, name, role, email
      FROM users
      WHERE business_id = $1
      `,
      [req.user.business_id]
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err.message);

    res.status(500).json({
      message: "Server error"
    });

  }

});

module.exports = router;