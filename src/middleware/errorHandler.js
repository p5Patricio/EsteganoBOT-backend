const logger = require("../utils/logger");

function errorHandler(err, req, res, _next) {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: "File too large",
      maxBytes: 5242880,
    });
  }

  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const status = err.status || 500;
  const response = {
    error: err.message || "Internal server error",
  };

  if (err.code && err.code !== "LIMIT_FILE_SIZE") {
    response.code = err.code;
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
