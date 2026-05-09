const path = require("path");
const config = require("../config");

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg"];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg"];
const MAX_MESSAGE_LENGTH = 1000;

function isSafeFilename(name) {
  if (!name || typeof name !== "string") return false;
  // Reject path traversal attempts and null bytes only
  if (name.includes("..") || name.includes("\0")) return false;
  return true;
}

function validateFile(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ error: "Image is required" });
  }

  const file = req.file;

  if (file.size > config.MAX_FILE_SIZE_BYTES) {
    return res.status(413).json({ error: "File too large", maxBytes: config.MAX_FILE_SIZE_BYTES });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return res.status(415).json({ error: "Unsupported file type" });
  }

  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return res.status(415).json({ error: "Unsupported file type" });
  }

  if (!isSafeFilename(file.originalname)) {
    return res.status(400).json({ error: "Invalid filename" });
  }

  req.file.sanitizedName = path.basename(file.originalname);

  if (req.body.message !== undefined) {
    if (typeof req.body.message !== "string") {
      return res.status(400).json({ error: "Message must be a string" });
    }
    if (req.body.message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: "Message too long", maxChars: MAX_MESSAGE_LENGTH });
    }
  }

  next();
}

module.exports = validateFile;
