const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    // ✅ Check header exists
    if (!authHeader) {
      return res.status(401).json({
        message: "No authorization header",
      });
    }

    // ✅ Must start with Bearer
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    // ✅ Extract token
    const token = authHeader.split(" ")[1];

    console.log("TOKEN:", token);

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (err) {
    console.error(
      "JWT VERIFY ERROR:",
      err.message
    );

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = protect;