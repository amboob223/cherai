const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "devsecret";

// =========================
// PROTECT (AUTH MIDDLEWARE)
// =========================
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// =========================
// AUTHORIZE (ROLE CHECK)
// =========================
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

// ✅ EXPORT BOTH (THIS IS THE FIX)
module.exports = {
  protect,
  authorize,
};