const _ = require("lodash");
const { getObjectIdFromString } = require("../../helpers/db");
const { generateFormError } = require("../../helpers/form-error-helper");

const addBadInventory = async (req, res) => {
  const { serial_no, reason } = req.body;

  if (!serial_no || typeof serial_no !== "string" || !serial_no.trim()) {
    return res.error(generateFormError("SERIAL_NO_REQUIRED", "serial_no", "Serial number is a required field"));
  }

  if (!reason || typeof reason !== "string" || !reason.trim()) {
    return res.error(generateFormError("REASON_REQUIRED", "reason", "Reason is a required field"));
  }

  // Check if serial number exists
  const [sno_err, sno] = await wait(_models.Inventory.findOne, _models.Inventory, { serial_number: serial_no });

  if (sno_err) {
    console.log(JSON.stringify(sno_err));
    return res.error("Something went wrong");
  }

  if (!sno) {
    return res.error(generateFormError("SERIAL_NO_NOT_FOUND", "serial_no", "Serial number does not exist"));
  }

  if (sno.condition === "bad") {
    return res.error(generateFormError("SERIAL_NO_BAD", "serial_no", "Serial number already exists in bad inventory"));
  }

  if (!!sno.sale_order) {
    return res.error(generateFormError("SERIAL_NO_SOLD", "serial_no", "Inventory is already sold"));
  }

  const [usno_err, usno] = await wait(
    _models.Inventory.updateOne,
    _models.Inventory,
    { serial_number: serial_no },
    { condition: "bad", condition_reason: reason }
  );

  if (usno_err) {
    console.log(JSON.stringify(usno_err));
    return res.error("Something went wrong");
  }

  return res.success(usno);

  // const [o_err, order] = await wait(_models.Order.findOne, _models.Order, { "items.serial_numbers": { $elemMatch: { number: serial_no.trim() } } });

  // if (o_err) {
  //   console.log(JSON.stringify(o_err));
  //   return res.error("Something went wrong");
  // }

  // if (!order) {
  //   return res.error(generateFormError("SERIAL_NO_NOT_FOUND", "serial_no", "Serial number does not exist"));
  // }

  // const [bo_err, badOrder] = await wait(_models.Order.findOne, _models.Order, {
  //   "items.serial_numbers": { $elemMatch: { number: serial_no.trim(), bad_condition: true } },
  // });

  // if (bo_err) {
  //   console.log(JSON.stringify(bo_err));
  //   return res.error("Something went wrong");
  // }

  // if (badOrder) {
  //   return res.error(generateFormError("SERIAL_NO_BAD", "serial_no", "Serial number already exists in bad inventory"));
  // }

  // const [u_err, updateRecord] = await wait(
  //   _models.Order.updateOne,
  //   _models.Order,
  //   { "items.serial_numbers.number": serial_no.trim() },
  //   { $set: { "items.$[].serial_numbers.$[x].bad_condition": true, "items.$[].serial_numbers.$[x].bad_condition_reason": reason.trim() } },
  //   { arrayFilters: [{ "x.number": serial_no }] }
  // );

  // if (u_err) {
  //   console.log(JSON.stringify(u_err));
  //   return res.error("Something went wrong");
  // }

  // return res.success(updateRecord);
};

module.exports = addBadInventory;
