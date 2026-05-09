const path = require("path");
const stegoService = require("../services/stegoService");

async function hide(req, res, next) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const { buffer, originalname } = req.file;

    const resultBuffer = await stegoService.conceal(message, buffer, originalname);

    const ext = path.extname(originalname).toLowerCase() || ".png";
    const downloadName = `stego${ext}`;

    res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
    res.setHeader("Content-Type", req.file.mimetype);
    res.send(resultBuffer);
  } catch (err) {
    next(err);
  }
}

async function reveal(req, res, next) {
  try {
    const { buffer, originalname } = req.file;

    const message = await stegoService.reveal(buffer, originalname);

    res.json({ message });
  } catch (err) {
    next(err);
  }
}

module.exports = { hide, reveal };
