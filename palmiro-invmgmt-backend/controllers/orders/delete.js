const { getObjectIdFromString } = require("../../helpers/db");
const { generateFormError } = require("../../helpers/form-error-helper");

const deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  if (!orderId || typeof orderId !== "string") {
    return res.error(generateFormError("FORM_ERROR", null, "Invalid order ID"));
  }

  const [o_err, order] = await wait(_models.Order.findOne, _models.Order, { _id: getObjectIdFromString(orderId), mode: "intransit" });

  if (o_err) {
    return res.error(generateFormError("FORM_ERROR", null, "Something went wrong"));
  }

  if (!order) {
    return res.error(generateFormError("FORM_ERROR", null, "Invalid order ID"));
  }

  const [do_err, delOrder] = await wait(_models.Order.deleteOne, _models.Order, { _id: getObjectIdFromString(orderId) });

  if (do_err) {
    return res.error(generateFormError("FORM_ERROR", null, "Something went wrong"));
  }

  return res.success(delOrder);
};

module.exports = deleteOrder;
