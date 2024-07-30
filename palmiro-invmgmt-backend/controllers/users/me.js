const me = async (req, res) => {
  return res.success(req.user);
};

module.exports = me;
