// server/routes/policies.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const upload = require("../middleware/upload");
const {
  attachDocumentToPolicy,
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
} = require("../controllers/policyController");

// Upload a file and attach to a policy
router.post(
  "/:id/upload",
  protect,
  authorizeRoles("admin", "manager"),
  upload.single("document"),
  attachDocumentToPolicy
);

// Other policy routes
router.get("/", protect, getPolicies);
router.post("/", protect, authorizeRoles("admin", "manager"), createPolicy);
router.get("/:id", protect, getPolicyById);
router.put("/:id", protect, authorizeRoles("admin", "manager"), updatePolicy);
router.delete("/:id", protect, authorizeRoles("admin"), deletePolicy);

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const { protect } = require("../middleware/authMiddleware");
// const authorizeRoles = require("../middleware/authorizeRoles");

// const upload = require("../middlewares/upload"); // CommonJS style
// const {
//   attachDocumentToPolicy,
//   getPolicies,
//   getPolicyById,
//   createPolicy,
//   updatePolicy,
//   deletePolicy,
// } = require("../controllers/policyController");

// // Upload a file and attach to a policy
// router.post(
//   "/:id/upload",
//   protect,
//   authorizeRoles("admin", "manager"), // optional: restrict uploads to certain roles
//   upload.single("document"), // "document" is the field name in FormData
//   attachDocumentToPolicy
// );

// // Other policy routes
// router.get("/", protect, getPolicies);
// router.post("/", protect, authorizeRoles("admin", "manager"), createPolicy);
// router.get("/:id", protect, getPolicyById);
// router.put("/:id", protect, authorizeRoles("admin", "manager"), updatePolicy);
// router.delete("/:id", protect, authorizeRoles("admin"), deletePolicy);

// module.exports = router;