process.on("uncaughtExceptionMonitor", (err) => {
  console.log(`Caught uncaughtException ${err.message} \n ${err.stack}`);
});
process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at:", p, "reason:", reason);
});

const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const loadConfig = require("./helpers/config");
//setup config file
global.appRoot = path.resolve(__dirname);
global.config = loadConfig(appRoot);
global.wait = require("./helpers/wait");
const commonRes = require("./helpers/response");
const getRoutes = require("./routes");
const mongoose = require("./helpers/db-connect");

const PORT = config.PORT || 5001;
const app = express();
app.use(cors());
app.set("trust proxy", 1); // trust first proxy
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", (req, res, next) => {
  console.log(req.method + " " + req.url);
  next();
});

app.use((req, res, next) => {
  res = commonRes.wrapResponse(req, res);
  next();
});

let routes = getRoutes(express.Router());

app.use(routes);

mongoose(function () {
  app.listen(PORT, () => console.log(`Listening on ${PORT}`));
});
