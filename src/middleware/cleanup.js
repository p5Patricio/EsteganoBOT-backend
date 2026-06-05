const fs = require("fs-extra");
const logger = require("../utils/logger");

/**
 * Cleanup middleware that deletes the uploaded file after the response is sent.
 */
function cleanup(req, res, next) {
  res.on("finish", async () => {
    if (req.file && req.file.path) {
      try {
        await fs.remove(req.file.path);
        // No loggeamos éxito para no ensuciar, solo errores
      } catch (err) {
        logger.error("Cleanup failed", { path: req.file.path, error: err.message });
      }
    }
  });
  next();
}

module.exports = cleanup;
