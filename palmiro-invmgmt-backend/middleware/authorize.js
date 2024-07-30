const jwt = require("jsonwebtoken");
const _ = require("lodash");
const { cleanUserObj } = require("../helpers/user");

const authorize = async (req, res, next) => {
  const { authtoken } = req.headers;

  if (!authtoken || typeof authtoken !== "string") {
    return res.error("Authentication required");
  }

  try {
    const data = jwt.verify(authtoken, config.JWT_SECRET_KEY);
    if (!data || !data.username) {
      return res.error("Invalid token");
    }

    const [u_err, user] = await wait(_models.User.findOne, _models.User, { username: data.username });

    if (u_err) {
      return res.error("Something went wrong");
    }

    if (!user) {
      return res.error("Invalid token - user does not exist");
    }

    req.user = cleanUserObj(user.toObject());
    req.user.token = authtoken;
    next();
  } catch (err) {
    return res.error("Invalid token");
  }
};

module.exports = authorize;
