const mongoose = require("mongoose");
const models = require("../models");
const mongoUriBuilder = require("mongo-uri-builder");

const defaultOptions = {
  useMongoClient: true,
  native_parser: true,
  auth: {
    user: "admin",
    password: "root",
  },
  readPreference: "primaryPreferred",
  autoReconnect: true,
  poolSize: 8,
  keepAlive: 500,
  connectTimeoutMS: 20000,
  replicaSet: "",
  w: "majority",
  wtimeout: 2000,
};

let options = config.mongo.options || defaultOptions;
let connection_string = getConnStr(config.mongo, console, options);

function getConnStr(mongo, logger, opts) {
  var connectionStr = mongoUriBuilder({
    username: encodeURIComponent(mongo.username),
    password: encodeURIComponent(mongo.password),
    host: mongo.replicas,
    replicas: mongo.replicaSet,
    database: mongo.database,
    options: opts,
  });
  return connectionStr;
}

const initConnection = (callback) => {
  mongoose.connect(connection_string);
  const db = mongoose.connection;
  db.on("error", function (err) {
    dbLogger("Failed to connect to database");
    dbLogger(err);
    process.exit(1);
  });

  db.on("connecting", function () {
    dbLogger("connecting to mongo db...");
  });

  db.on("error", function (error) {
    console.error("error in mongo db connection: " + error);
  });

  db.on("connected", function () {
    dbLogger("Mongo db connected!");
  });

  db.once("open", function () {
    dbLogger("Mongo db connection opened.");
    models.setup(db).then((res) => {
      dbLogger("Models Set Successfully.");
      callback(db);
    });
  });

  db.on("reconnected", function () {
    dbLogger("Mongo db reconnected!");
  });

  db.on("disconnected", function () {
    dbLogger("Mongo db disconnected!");
  });
};

function dbLogger(message) {
  console.log(`${new Date().toString()} - ${message}`);
}

module.exports = initConnection;
