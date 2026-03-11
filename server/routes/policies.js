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

// GET all policies
router.get("/", protect, getPolicies);

// CREATE policy
router.post("/", protect, authorizeRoles("admin", "manager"), createPolicy);

// GET single policy
router.get("/:id", protect, getPolicyById);

// UPDATE policy
router.put("/:id", protect, authorizeRoles("admin", "manager"), updatePolicy);

// DELETE policy
router.delete("/:id", protect, authorizeRoles("admin"), deletePolicy);

module.exports = router;