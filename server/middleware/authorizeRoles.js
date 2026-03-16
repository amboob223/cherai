// middleware/authorizeRoles.js
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: `Role ${req.user?.role || "unknown"} not allowed. Allowed roles: ${roles.join(", ")}`,
      });
    }
    next();
  };
};

module.exports = authorizeRoles;