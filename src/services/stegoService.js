const steggy = require("steggy");
const logger = require("../utils/logger");

async function conceal(message, imageBuffer) {
  try {
    const result = steggy.conceal("")(imageBuffer, message);
    return result;
  } catch (err) {
    logger.error("Steggy conceal failed", { error: err.message });
    const wrapped = new Error("Processing failed");
    wrapped.code = "STEGGY_ERROR";
    throw wrapped;
  }
}

async function reveal(imageBuffer) {
  try {
    const revealed = steggy.reveal("")(imageBuffer);
    return Buffer.isBuffer(revealed) ? revealed.toString("utf-8") : revealed;
  } catch (err) {
    logger.error("Steggy reveal failed", { error: err.message });
    const wrapped = new Error("Processing failed");
    wrapped.code = "STEGGY_ERROR";
    throw wrapped;
  }
}

module.exports = { conceal, reveal };
