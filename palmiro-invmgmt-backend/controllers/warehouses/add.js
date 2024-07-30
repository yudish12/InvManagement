const { generateFormError } = require("../../helpers/form-error-helper");

const add = async (req, res) => {
  const { name, desc } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.error(generateFormError("NAME_REQUIRED", "name", "Warehouse name is a required field"));
  }

  const label = name.trim();
  const value = label.toLowerCase();

  const [a_err, warehouse] = await wait(_models.Warehouse.create, _models.Warehouse, { label, value, desc: desc || "" });

  if (a_err) {
    return res.error(generateFormError("NAME_DUPLICATE", "name", "Warehouse name already in use"));
  }

  return res.success(warehouse);
};

module.exports = add;
