// server/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Make sure the uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Optional: only allow certain file types
const fileFilter = (req, file, cb) => {
  cb(null, true); // allow all for now
};

// Export Multer instance
const upload = multer({ storage, fileFilter });
module.exports = upload;