const path = require("path");
const createApp = require("./app");
const config = require("./config");
const logger = require("./utils/logger");
const { startScheduledCleanup } = require("./utils/fileCleanup");

const app = createApp();

const uploadDir = path.join(process.cwd(), "uploads");
// Limpieza cada 30 minutos, archivos de más de 1 hora
startScheduledCleanup(uploadDir, 3600000, 1800000);

app.listen(config.PORT, () => {
  logger.info("Server started", { port: config.PORT, env: config.NODE_ENV });
});
