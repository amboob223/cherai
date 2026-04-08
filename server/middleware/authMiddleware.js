const jwt = require("jsonwebtoken");

const SECRET = "secretkey";

const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    if (token.startsWith("Bearer")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;

    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};




module.exports = { protect, authorize };