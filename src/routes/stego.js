const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const router = express.Router();
const stegoController = require("../controllers/stegoController");
const validateFile = require("../middleware/validateFile");
const cleanup = require("../middleware/cleanup");
const config = require("../config");

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "uploads");
fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: config.MAX_FILE_SIZE_BYTES },
});

router.post("/hide", upload.single("image"), cleanup, validateFile, stegoController.hide);
router.post("/reveal", upload.single("image"), cleanup, validateFile, stegoController.reveal);

module.exports = router;
