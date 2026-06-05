const logger = require("../utils/logger");
const config = require("../config");

function errorHandler(err, req, res, _next) {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: "File too large",
      maxBytes: config.MAX_FILE_SIZE_BYTES || 5242880,
    });
  }

  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const status = err.status || 500;
  
  // En producción, no queremos exponer detalles de errores 500
  const isProduction = config.NODE_ENV === "production";
  const message = (isProduction && status === 500) 
    ? "Internal server error" 
    : (err.message || "Internal server error");

  const response = {
    error: message,
  };

  if (err.code && err.code !== "LIMIT_FILE_SIZE") {
    // Solo enviamos el código si no es un error interno genérico en producción
    if (!isProduction || status !== 500) {
      response.code = err.code;
    }
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
