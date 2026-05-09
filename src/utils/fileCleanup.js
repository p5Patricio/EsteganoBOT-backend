const fs = require("fs-extra");
const logger = require("./logger");

async function safeRemove(filePath) {
  if (!filePath) return;
  try {
    await fs.remove(filePath);
  } catch (err) {
    logger.error("Failed to remove temp file", { path: filePath, error: err.message });
  }
}

module.exports = { safeRemove };
