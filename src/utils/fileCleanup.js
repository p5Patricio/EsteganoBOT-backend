const fs = require("fs-extra");
const path = require("path");
const logger = require("./logger");

async function safeRemove(filePath) {
  if (!filePath) return;
  try {
    await fs.remove(filePath);
  } catch (err) {
    logger.error("Failed to remove temp file", { path: filePath, error: err.message });
  }
}

/**
 * Periodically cleans up old files in the upload directory.
 * @param {string} uploadDir - Path to the upload directory.
 * @param {number} maxAgeMs - Maximum age of files in milliseconds.
 * @param {number} intervalMs - How often to run the cleanup in milliseconds.
 */
function startScheduledCleanup(uploadDir, maxAgeMs = 3600000, intervalMs = 1800000) {
  logger.info("Starting scheduled cleanup", { uploadDir, maxAgeMs, intervalMs });

  setInterval(async () => {
    try {
      const files = await fs.readdir(uploadDir);
      const now = Date.now();

      for (const file of files) {
        // Ignorar .gitkeep si existe
        if (file === ".gitkeep") continue;

        const filePath = path.join(uploadDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > maxAgeMs) {
          await fs.remove(filePath);
          logger.info("Removed orphan file", { path: filePath });
        }
      }
    } catch (err) {
      logger.error("Scheduled cleanup failed", { error: err.message });
    }
  }, intervalMs);
}

module.exports = { safeRemove, startScheduledCleanup };
