const express = require("express");
const router = express.Router();
const {
  createTask,
  assignUser,
  updateStatus,
  getTasks
} = require("../controllers/taskController");

// Create task
router.post("/", createTask);

// Assign user
router.put("/:taskId/assign", assignUser);

// Update status
router.put("/:taskId/status", updateStatus);

// Get tasks (filter by assignedUser)
router.get("/", getTasks);

module.exports = router;