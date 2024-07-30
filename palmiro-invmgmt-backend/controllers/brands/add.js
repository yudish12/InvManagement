const { generateFormError } = require("../../helpers/form-error-helper");

const add = async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.error(generateFormError("NAME_REQUIRED", "name", "Brand name is a required field"));
  }

  const label = name.trim();
  const value = label.toLowerCase();

  const [a_err, brand] = await wait(_models.Brand.create, _models.Brand, { label, value });

  if (a_err) {
    return res.error(generateFormError("NAME_DUPLICATE", "name", "Brand name already in use"));
  }

  return res.success(brand);
};

module.exports = add;
