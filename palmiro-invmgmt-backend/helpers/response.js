const { serializeOutput } = require("./utils");

function wrapResponse(req, res) {
  res.success = function (msg, ...options) {
    let { code } = options;
    let statusCode = code || 200;
    return res.status(statusCode).send(serializeOutput({ output: msg }, req));
  };

  res.error = function (msg, ...options) {
    let { code } = options;
    let statusCode = code || 400;
    if (typeof msg !== "string") {
      return res.status(statusCode).send(msg);
    } else {
      return res.status(statusCode).send({ message: msg });
    }
  };
  return res;
}

module.exports = {
  wrapResponse,
};
