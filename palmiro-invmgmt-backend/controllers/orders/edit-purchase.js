const _ = require("lodash");
const { getObjectIdFromString } = require("../../helpers/db");
const { generateFormError } = require("../../helpers/form-error-helper");

const editPurchase = async (req, res) => {
  const { _id, account, comments, invoiceNo, bill_date, credit_period, mode, inward_date, warehouse, items } = req.body;

  if (typeof _id !== "string" || !_id.trim()) {
    return res.error(generateFormError("FORM_ERROR", null, "Order ID Invalid"));
  }

  const [eo_err, existingOrder] = await wait(_models.Order.findOne, _models.Order, { _id: getObjectIdFromString(_id) });

  if (eo_err) {
    return res.error(generateFormError("FORM_ERROR", null, "Something went wrong"));
  }

  if (!existingOrder) {
    return res.error(generateFormError("FORM_ERROR", null, "Order ID Invalid"));
  }

  if (existingOrder.mode !== "intransit") {
    return res.error(generateFormError("FORM_ERROR", null, "Order is not in transit. Only in transit orders can be modified"));
  }

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

  const _bill_date = new Date(bill_date);
  if (isNaN(_bill_date)) {
    return res.error(generateFormError("BILL_DATE_REQUIRED", "bill_dae", "Bill date is required"));
  }
  createObj.bill_date = _bill_date;

  if (!credit_period || !/\d+/.test(credit_period) || parseInt(credit_period) < 0) {
    return res.error(generateFormError("CREDIT_PERIOD_INVALID", "credit_period", "Credit period is invalid"));
  }
  createObj.credit_period = parseInt(credit_period);

  if (!mode) {
    return res.error(generateFormError("MODE_REQUIRED", "mode", "Mode is a required field"));
  }

  if (!["intransit", "inward"].includes(mode)) {
    return res.error(generateFormError("MODE_INVALID", "mode", "Mode can only be Inward or In Transit for a purchase order"));
  }

  createObj.mode = mode;

  if (mode === "inward") {
    const _inward_date = new Date(inward_date);
    if (isNaN(_inward_date)) {
      return res.error(generateFormError("INWARD_DATE_REQUIRED", "inward_date", "Inward date is required"));
    }
    createObj.inward_date = _inward_date;
  }

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

    // Validate serial number count
    if (mode === "inward") {
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
          generateFormError(
            "SERIALNO_DUPLICATES",
            `serialNos-${i}`,
            `Serial numbers contain following duplicates ${duplicateSerialNoArr.join(", ")}`
          )
        );
      }

      const emptySerialNumber = serialNosArr.find((e) => typeof e !== "string" || !e.trim().length);
      if (emptySerialNumber) {
        return res.error(generateFormError("SERIALNO_DUPLICATES", `serialNos-${i}`, `Serial numbers cannot contain blank value(s)`));
      }

      item.serial_numbers = [];

      const [scheck_err, scheck] = await wait(_models.Inventory.aggregate, _models.Inventory, [
        { $match: { serial_number: { $in: serialNosArr } } },
        { $project: { serial_number: 1, _id: 0 } },
      ]);

      if (scheck_err) {
        return res.error("Something went wrong while checking duplicate serial numbers");
      }

      if (scheck.length > 0) {
        return res.error(
          generateFormError(
            "SERIALNO_DUPLICATES",
            `serialNos-${i}`,
            `Serial numbers ${scheck.map((e) => e.serial_number).join(", ")} are already in use`
          )
        );
      }

      for (let j = 0; j < serialNosArr.length; j++) {
        item.serial_numbers.push(serialNosArr[j]);
        inventories.push({
          serial_number: serialNosArr[j],
          part_code: item.part_code,
          brand: item.brand,
          price: item.price,
          warranty_inward: item.warranty_period,
          warehouse: createObj.warehouse,
          bill_date: createObj.bill_date,
          credit_period: createObj.credit_period,
        });
      }
    } else {
      // for (i = 0; i < item.qty; i++) {
      //   item.serial_numbers.push({
      //     number: "",
      //   });
      // }
    }
    createObj.items.push(item);
  }

  createObj.comments = "";
  if (typeof comments === "string" && comments.trim()) {
    createObj.comments = comments.trim();
  }

  const [o_err, order] = await wait(_models.Order.updateOne, _models.Order, { _id: getObjectIdFromString(_id) }, { $set: createObj });

  if (o_err) {
    console.log(o_err);
    return res.error(generateFormError("FORM_ERROR", null, "Something went wrong"));
  }

  if (inventories.length > 0) {
    // update order._id as inventory.purchase_order
    for (let i = 0; i < inventories.length; i++) {
      inventories[i].purchase_order = getObjectIdFromString(_id);
    }
    const [i_err, invRecords] = await wait(_models.Inventory.insertMany, _models.Inventory, inventories);

    // if (i_err) {
    //   // roll back created order
    //   const [rb_err, rollback] = await wait(_models.Order.deleteOne, _models.Order, { _id: getObjectIdFromString(order._id) });
    //   return res.error("Something went wrong while creating inventory records");
    // }
  }

  return res.success(order);
};

module.exports = editPurchase;
