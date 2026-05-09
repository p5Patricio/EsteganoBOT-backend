const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const config = require("./config");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const stegoRoutes = require("./routes/stego");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN }));
  app.use(
    rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          error: "Too many requests",
          retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000),
        });
      },
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", stegoRoutes);

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
