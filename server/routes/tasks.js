const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

// CREATE TASK
router.post(
  "/",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").optional().isString(),
    body("due_date").optional().isISO8601().withMessage("Invalid date format")
  ],
  validate,
  createTask
);

module.exports = router;