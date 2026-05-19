const path = require("path");
const config = require("../config");

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg"];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg"];
const MAX_MESSAGE_LENGTH = 1000;

function isSafeFilename(name) {
  if (!name || typeof name !== "string") return false;
  // Solo permitir caracteres alfanuméricos, guiones, puntos y espacios
  const safePattern = /^[a-zA-Z0-9._\-\s]+$/;
  return safePattern.test(name) && !name.includes("..");
}

function hasValidMagicBytes(buffer, mimetype) {
  if (!buffer || !Buffer.isBuffer(buffer)) return false;

  if (mimetype === "image/png") {
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    return buffer.subarray(0, 8).equals(pngMagic);
  }

  if (mimetype === "image/jpeg") {
    // JPEG: FF D8 FF
    const jpegMagic = Buffer.from([0xff, 0xd8, 0xff]);
    return buffer.subarray(0, 3).equals(jpegMagic);
  }

  return false;
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

  if (!hasValidMagicBytes(file.buffer, file.mimetype)) {
    return res.status(415).json({ error: "Invalid image format" });
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
