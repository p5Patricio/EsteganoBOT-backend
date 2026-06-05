const steggy = require("steggy");
const fs = require("fs-extra");
const logger = require("../utils/logger");

async function conceal(message, imageBufferOrPath, password = "") {
  let imageBuffer = imageBufferOrPath;
  if (typeof imageBufferOrPath === "string") {
    imageBuffer = await fs.readFile(imageBufferOrPath);
  }

  try {
    const result = steggy.conceal(password)(imageBuffer, message);
    return result;
  } catch (err) {
    logger.error("Steggy conceal failed", { error: err.message });
    const wrapped = new Error("Processing failed");
    wrapped.code = err.message === "corrupt" ? "INVALID_PASSWORD" : "STEGGY_ERROR";
    throw wrapped;
  }
}

async function reveal(imageBufferOrPath, password = "") {
  let imageBuffer = imageBufferOrPath;
  if (typeof imageBufferOrPath === "string") {
    imageBuffer = await fs.readFile(imageBufferOrPath);
  }

  try {
    const revealed = steggy.reveal(password)(imageBuffer);
    return Buffer.isBuffer(revealed) ? revealed.toString("utf-8") : revealed;
  } catch (err) {
    logger.error("Steggy reveal failed", { error: err.message });
    const wrapped = new Error("Processing failed");
    wrapped.code = err.message === "corrupt" ? "INVALID_PASSWORD" : "STEGGY_ERROR";
    throw wrapped;
  }
}

module.exports = { conceal, reveal };
