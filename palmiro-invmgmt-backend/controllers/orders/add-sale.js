const _ = require("lodash");
const { getObjectIdFromString } = require("../../helpers/db");
const { generateFormError } = require("../../helpers/form-error-helper");

const addSale = async (req, res) => {
  const { account, comments, invoiceNo, bill_date, credit_period, po_number, mode, outward_date, warehouse, items } = req.body;

  const createObj = {};
  const inventories = [];

  if (!["palmiro", "qvent", "trioline"].includes(account)) {
    return res.error(generateFormError("ACCOUNT_INVALID", "account", "Account is invalid"));
  }
  createObj.account = account;

  if (typeof invoiceNo !== "string" || !invoiceNo.trim()) {
    return res.error(generateFormError("INVOICE_NO_REQUIRED", "invoiceNo", "Invoice number is required"));
  }
  createObj.invoice_number = invoiceNo.trim();

  createObj.po_number = "";
  if (typeof po_number === "string" && po_number.trim().length > 0) {
    createObj.po_number = po_number.trim();
  }

  const _bill_date = new Date(bill_date);
  if (isNaN(_bill_date)) {
    return res.error(generateFormError("BILL_DATE_REQUIRED", "bill_dae", "Bill date is required"));
  }
  createObj.bill_date = _bill_date;

  if (!credit_period || !/\d+/.test(credit_period) || parseInt(credit_period) < 0) {
    return res.error(generateFormError("CREDIT_PERIOD_INVALID", "credit_period", "Credit period is invalid"));
  }
  createObj.credit_period = parseInt(credit_period);

  createObj.mode = "outward";

  if (!warehouse || typeof warehouse.value !== "string") {
    return res.error(generateFormError("WAREHOUSE_REQUIRED", "warehouse", "Warehouse is a required field"));
  }

  const [w_err, _warehouse] = await wait(_models.Warehouse.findOne, _models.Warehouse, { _id: getObjectIdFromString(warehouse._id) });

  if (w_err) {
    return res.error("Something went wrong");
  }

  if (!_warehouse) {
    return res.error(generateFormError("WAREHOUSE_INVALID", "warehouse", "Warehouse is invalid"));
  }

  createObj.warehouse = getObjectIdFromString(_warehouse._id);

  createObj.items = [];

  if (!Array.isArray(items) || items.length < 1) {
    return res.error(generateFormError("ITEMS_REQUIRED", "items", "Items are required"));
  }

  for (let i = 0; i < items.length; i++) {
    const { partcode, qty, serialNos, price, warranty_period } = items[i];

    const item = {};

    // Part code
    if (!partcode || typeof partcode.code !== "string") {
      return res.error(generateFormError("PARTCODE_REQUIRED", `partcode-${i}`, "Part code is a required field"));
    }
    const [pc_err, _partcode] = await wait(_models.PartCode.findOne, _models.PartCode, { _id: getObjectIdFromString(partcode._id) });
    if (pc_err) {
      return res.error("Something went wrong");
    }
    if (!_partcode) {
      return res.error(generateFormError("PARTCODE_INVALID", `partcode-${i}`, "Part code is invalid"));
    }
    item.part_code = getObjectIdFromString(_partcode._id);
    item.brand = getObjectIdFromString(_partcode.brand);

    // Quantity
    if (!qty) {
      return res.error(generateFormError("QTY_REQUIRED", `qty-${i}`, "Quantity is a required field"));
    }
    if (isNaN(parseInt(qty)) || !/\d+/.test(qty) || parseInt(qty) <= 0) {
      return res.error(generateFormError("QTY_REQUIRED", `qty-${i}`, "Quantity is invalid, it must be positive number without decimals"));
    }
    item.qty = parseInt(qty);

    // Price
    if (!price) {
      return res.error(generateFormError("PRICE_REQUIRED", `price-${i}`, "Price is a required field"));
    }
    if (isNaN(parseFloat(price)) || !/\d+/.test(price) || parseFloat(price) <= 0) {
      return res.error(generateFormError("PRICE_INVALID", `price-${i}`, "Price is invalid, it must be positive number"));
    }
    item.price = parseFloat(price);

    // Warranty
    if (typeof warranty_period !== "string" || warranty_period.length < 1 || !/\d+/.test(warranty_period) || parseInt(warranty_period) < 0) {
      return res.error(generateFormError("WARRANTY_PERIOD_INVALID", `warranty_period-${i}`, "Warranty period is invalid"));
    }
    item.warranty_period = parseInt(warranty_period);

    if (typeof serialNos !== "string" || !serialNos.trim()) {
      return res.error(generateFormError("SERIAL_NO_REQUIRED", `serialNos-${i}`, "Serial numbers are required"));
    }

    const serialNosArr = serialNos.trim().split("\n");
    if (serialNosArr.length !== item.qty) {
      return res.error(generateFormError("SERIAL_NO_INVALID", `serialNos-${i}`, "Serial numbers provided are more than quantity"));
    }

    const duplicateSerialNoArr = serialNosArr.filter((item, index) => serialNosArr.indexOf(item) !== index);
    if (duplicateSerialNoArr.length > 0) {
      return res.error(
        generateFormError("SERIALNO_DUPLICATES", `serialNos-${i}`, `Serial numbers contain following duplicates ${duplicateSerialNoArr.join(", ")}`)
      );
    }

    const emptySerialNumber = serialNosArr.find((e) => typeof e !== "string" || !e.trim().length);
    if (emptySerialNumber) {
      return res.error(generateFormError("SERIALNO_DUPLICATES", `serialNos-${i}`, `Serial numbers cannot contain blank value(s)`));
    }

    item.serial_numbers = [];

    // check if serial number exists
    const [scheck_err, scheck] = await wait(_models.Inventory.aggregate, _models.Inventory, [{ $match: { serial_number: { $in: serialNosArr } } }]);

    if (scheck_err) {
      return res.error("Something went wrong while checking duplicate serial numbers in sale order");
    }

    const notExistCheck = serialNosArr.filter((e) => !scheck.find((x) => x.serial_number === e));
    if (notExistCheck.length > 0) {
      return res.error(
        generateFormError("SERIALNO_MISSING", `serialNos-${i}`, `Serial numbers ${notExistCheck.join(", ")} do not exist in inventory`)
      );
    }

    const alreadySoldCheck = serialNosArr.filter((e) => !!scheck.find((x) => x.serial_number === e)?.sale_order);
    if (alreadySoldCheck.length > 0) {
      return res.error(generateFormError("SERIALNO_MISSING", `serialNos-${i}`, `Serial numbers ${alreadySoldCheck.join(", ")} are already sold`));
    }

    const badConditionSnos = serialNosArr.filter((e) => scheck.find((x) => x.serial_number === e).condition === "bad");
    if (badConditionSnos.length > 0) {
      return res.error(
        generateFormError(
          "SERIALNO_MISSING",
          `serialNos-${i}`,
          `Serial numbers ${badConditionSnos.join(", ")} are marked as bad inventory and should not be sold`
        )
      );
    }

    const wrongPartcodeSnos = serialNosArr.filter((e) => scheck.find((x) => x.serial_number === e).part_code.toString() !== partcode._id);
    if (wrongPartcodeSnos.length > 0) {
      return res.error(
        generateFormError("SERIALNO_MISSING", `serialNos-${i}`, `Serial numbers ${wrongPartcodeSnos.join(", ")} do not belong to this part code`)
      );
    }

    const wrongWarehouseSnos = serialNosArr.filter((e) => scheck.find((x) => x.serial_number === e).warehouse.toString() !== warehouse._id);
    if (wrongWarehouseSnos.length > 0) {
      return res.error(
        generateFormError("SERIALNO_MISSING", `serialNos-${i}`, `Serial numbers ${wrongWarehouseSnos.join(", ")} do not belong to this warehouse`)
      );
    }

    for (let j = 0; j < serialNosArr.length; j++) {
      item.serial_numbers.push(serialNosArr[j]);
      inventories.push({
        serial_number: serialNosArr[j],
        selling_price: item.price,
        warranty_outward: item.warranty_period,
        status: "outward",
      });
    }
    createObj.items.push(item);
  }

  createObj.comments = "";
  if (typeof comments === "string" && comments.trim()) {
    createObj.comments = comments.trim();
  }

  const [o_err, order] = await wait(_models.Order.create, _models.Order, createObj);

  if (o_err) {
    console.log(o_err);
    res.error(generateFormError("FORM_ERROR", null, "Something went wrong"));
  }

  // update order._id as inventory.sale_order
  for (let i = 0; i < inventories.length; i++) {
    inventories[i].sale_order = getObjectIdFromString(order._id);
    const [ui_err, updateInv] = await wait(
      _models.Inventory.updateOne,
      _models.Inventory,
      { serial_number: inventories[i].serial_number },
      inventories[i]
    );
  }

  return res.success(order);
};
module.exports = addSale;
