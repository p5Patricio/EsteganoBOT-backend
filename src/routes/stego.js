const express = require("express");
const multer = require("multer");
const router = express.Router();
const stegoController = require("../controllers/stegoController");
const validateFile = require("../middleware/validateFile");
const config = require("../config");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.MAX_FILE_SIZE_BYTES },
});

router.post("/hide", upload.single("image"), validateFile, stegoController.hide);
router.post("/reveal", upload.single("image"), validateFile, stegoController.reveal);

module.exports = router;
