const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  console.log("🔥 ROUTE HIT");
  res.json({ message: "Dashboard working ✅" });
});

module.exports = router;