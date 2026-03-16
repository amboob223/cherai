// routes/policies.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
} = require("../controllers/policyController");

// Routes
router.get("/", protect, getPolicies);
router.post("/", protect, authorizeRoles("admin", "manager"), createPolicy);
router.get("/:id", protect, getPolicyById);
router.put("/:id", protect, authorizeRoles("admin", "manager"), updatePolicy);
router.delete("/:id", protect, authorizeRoles("admin"), deletePolicy);

module.exports = router;