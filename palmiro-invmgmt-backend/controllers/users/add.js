const addUser = async (req, res) => {
  const { username, password } = req.body;
  const [err, user] = await wait(_models.User.createUser, _models.User, { username, password });
  if (err) {
    console.log(err);
    return res.error("Something went wrong");
  }
  return res.success(user);
};

module.exports = addUser;
