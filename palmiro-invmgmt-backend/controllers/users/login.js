const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { cleanUserObj } = require("../../helpers/user");

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || typeof username !== "string" || !username.trim()) {
    return res.error(generateFormError("USERNAME_REQUIRED", "username", "Username is a required field"));
  }

  if (!password || typeof password !== "string") {
    return res.error(generateFormError("PASSWORD_REQUIRED", "password", "Password is a required field"));
  }

  const [u_err, user] = await wait(_models.User.findOne, _models.User, { username: username.toLowerCase() });

  if (u_err) {
    console.log(u_err);
    return res.error("Something went wrong");
  }

  if (!user) {
    return res.error("User does not exist");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.error("Invalid password");
  }

  const token = jwt.sign({ username: user.username }, config.JWT_SECRET_KEY);

  return res.success({ ...cleanUserObj(user.toObject()), token: token });
};

module.exports = loginUser;
