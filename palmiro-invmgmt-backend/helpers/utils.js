const Utils = {
  serializeOutput: function (obj) {
    return removeMongooseModel(obj);
  },
};

const isObject = (obj) => obj != null && obj.constructor?.name === "Object";

function removeMongooseModel(obj) {
  if (isObject(obj)) {
    return JSON.parse(JSON.stringify(obj));
  } else {
    return obj;
  }
}

module.exports = Utils;
