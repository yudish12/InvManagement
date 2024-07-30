import devConfig from "./development.json";
import prodConfig from "./production.json";

const config = {};

if (process.env.NODE_ENV === "production") {
  Object.assign(config, prodConfig);
} else {
  Object.assign(config, devConfig);
}

export default config;
