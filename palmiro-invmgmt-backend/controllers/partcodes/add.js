const { getObjectIdFromString } = require("../../helpers/db");
const { generateFormError } = require("../../helpers/form-error-helper");

const add = async (req, res) => {
  let { code, model, desc, brand } = req.body;

  if (!code || typeof code !== "string" || !code.trim()) {
    return res.error(generateFormError("CODE_REQUIRED", "code", "Part code is a required field"));
  }

  if (!model || typeof model !== "string" || !model.trim()) {
    return res.error(generateFormError("MODEL_REQUIRED", "model", "Model is a required field"));
  }

  if (!desc || typeof desc !== "string" || !desc.trim()) {
    return res.error(generateFormError("DESC_REQUIRED", "desc", "Description is a required field"));
  }

  code = code.trim();
  model = model.trim();
  desc = desc.trim();

  const uid = code.toLowerCase();

  // Check if code already exists
  const [e_err, exists] = await wait(_models.PartCode.findOne, _models.PartCode, { uid });

  if (e_err) {
    return res.error("Something went wrong");
  }

  if (exists) {
    return res.error(generateFormError("CODE_DUPLICATE", "code", "Part code already exists"));
  }

  if (!brand || !brand._id) {
    return res.error(generateFormError("BRAND_REQUIRED", "brand", "Brand is a required field"));
  }

  const brandId = getObjectIdFromString(brand._id);

  const [b_err, _brand] = await wait(_models.Brand.findOne, _models.Brand, { _id: brandId });

  if (b_err) {
    return res.error("Something went wrong");
  }

  if (!_brand) {
    return res.error(generateFormError("BRAND_INVALID", "brand", "Brand is invalid"));
  }

  const [a_err, partcode] = await wait(_models.PartCode.create, _models.PartCode, { brand: brandId, uid, code, model, desc });

  if (a_err) {
    return res.error("Something went wrong");
  }

  return res.success(partcode);
};

module.exports = add;
