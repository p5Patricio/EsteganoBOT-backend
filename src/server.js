const createApp = require("./app");
const config = require("./config");
const logger = require("./utils/logger");

const app = createApp();

app.listen(config.PORT, () => {
  logger.info("Server started", { port: config.PORT, env: config.NODE_ENV });
});
