require("dotenv").config();

function parseIntEnv(value, name) {
  if (value === undefined || value === "") {
    return null;
  }
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
  return parsed;
}

const PORT = parseIntEnv(process.env.PORT, "PORT") || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:8080";
const RATE_LIMIT_WINDOW_MS =
  parseIntEnv(process.env.RATE_LIMIT_WINDOW_MS, "RATE_LIMIT_WINDOW_MS") || 15 * 60 * 1000;
const RATE_LIMIT_MAX = parseIntEnv(process.env.RATE_LIMIT_MAX, "RATE_LIMIT_MAX") || 100;
const MAX_FILE_SIZE_MB = parseIntEnv(process.env.MAX_FILE_SIZE_MB, "MAX_FILE_SIZE_MB") || 5;
const TEMP_DIR = process.env.TEMP_DIR || "./temp";

function validate() {
  if (PORT < 1 || PORT > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}`);
  }
  if (RATE_LIMIT_WINDOW_MS < 1000) {
    throw new Error(`Invalid RATE_LIMIT_WINDOW_MS: ${process.env.RATE_LIMIT_WINDOW_MS}`);
  }
  if (RATE_LIMIT_MAX < 1) {
    throw new Error(`Invalid RATE_LIMIT_MAX: ${process.env.RATE_LIMIT_MAX}`);
  }
  if (MAX_FILE_SIZE_MB < 1) {
    throw new Error(`Invalid MAX_FILE_SIZE_MB: ${process.env.MAX_FILE_SIZE_MB}`);
  }
}

validate();

module.exports = {
  PORT,
  NODE_ENV,
  CORS_ORIGIN,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES: MAX_FILE_SIZE_MB * 1024 * 1024,
  TEMP_DIR,
};
