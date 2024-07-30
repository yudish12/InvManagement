const path = require("path");

const loadConfig = (appRoot) => {
  let env = String(process.env.NODE_ENV || "local");
  env = env.toLowerCase();
  try {
    console.log(`Environment set to ${env}`);
    const configPath = path.join(appRoot, "env", `${env}.json`);
    const config = require(configPath);
    console.log(`Config file path is ${configPath}`);
    config.environment = env;
    config.configPath = configPath;
    return config;
  } catch (e) {
    console.log(`Error in loading config file ${e.stack}`);
  }
};

module.exports = loadConfig;
