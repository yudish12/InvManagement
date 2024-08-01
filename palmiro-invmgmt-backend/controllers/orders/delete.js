const { getObjectIdFromString } = require("../../helpers/db");
const { generateFormError } = require("../../helpers/form-error-helper");

const deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  const { mode } = req.query;

  console.log(orderId);
  if (!orderId || typeof orderId !== "string") {
    return res.error(generateFormError("FORM_ERROR", null, "Invalid order ID"));
  }

  const [o_err, order] = await wait(_models.Order.findOne, _models.Order, {
    _id: getObjectIdFromString(orderId),
    mode: ["intransit", "inward"],
  });
  console.log(o_err, order);
  if (o_err) {
    return res.error(
      generateFormError("FORM_ERROR", null, "Something went wrong")
    );
  }

  if (!order) {
    return res.error(generateFormError("FORM_ERROR", null, "Invalid order ID"));
  }

  if (mode === "inward") {
    const session = await mongoose.startSession();
    session.startTransaction();
    const [condi_err, result] = await wait(
      _models.Inventory.find,
      _models.Inventory,
      {
        purchase_order: orderId,
        condition: "bad",
      }
    );

    if (result.length > 0)
      return res.error(
        generateFormError(
          "FORM_ERROR",
          null,
          "Some of the Products have Bad condition"
        )
      );

    const [del_err_inven, delInventory] = await wait(
      _models.Inventory.deleteMany,
      _models.Inventory,
      { purchase_order: orderId }
    );
    const [del_err_order, delOrder] = await wait(
      _models.Order.deleteMany,
      _models.Order,
      { _id: orderId }
    ).session(session);
  }
  // if (condi_err) {
  //   return res.error(generateFormError("FORM_ERROR", null, "Some of the Products have Bad condition"));
  // }

  const [do_err, delOrder] = await wait(
    _models.Order.deleteOne,
    _models.Order,
    { _id: getObjectIdFromString(orderId) }
  );

  if (do_err) {
    return res.error(
      generateFormError("FORM_ERROR", null, "Something went wrong")
    );
  }

  return res.success(delOrder);
};

module.exports = deleteOrder;
