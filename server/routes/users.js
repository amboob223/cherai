const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const { getAllUsers, deleteUser } = require("../controllers/userController");

// Only admin can view users
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);

// Only admin can delete users
router.delete("/users/:id", protect, authorizeRoles("admin"), deleteUser);

module.exports = router;