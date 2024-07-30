const _ = require("lodash");
const cleanUserObj = (user) => {
  return _.omit(user, ["password"]);
};

module.exports = {
  cleanUserObj,
};
