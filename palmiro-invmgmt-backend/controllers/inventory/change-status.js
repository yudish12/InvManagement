const { getObjectIdFromString } = require("../../helpers/db");
const { generateFormError } = require("../../helpers/form-error-helper");

const changeInventoryStatus = async (req, res) => {
  const { serial_number, status, reason } = req.body;

  if (typeof serial_number !== "string" || !serial_number.trim()) {
    return res.error("Invalid serial number");
  }

  if (!["return-pending", "return-intransit", "returned", "inward", "outward"].includes(status)) {
    return res.error("Status invalid");
  }

  if (status === "return-pending" && (typeof reason !== "string" || !reason.trim())) {
    return res.error(generateFormError("REASON_REQUIRED", "reason", "Reason is a required field"));
  }

  const [i_err, inventory] = await wait(_models.Inventory.findOne, _models.Inventory, { serial_number });

  if (i_err) {
    return res.error(generateFormError("FORM_ERROR", null, "Something went wrong"));
  }

  if (!inventory) {
    return res.error(generateFormError("FORM_ERROR", null, "Invalid serial number, inventory not found"));
  }

  if (status === "return-pending") {
    if (inventory.status !== "outward") {
      return res.error(
        generateFormError(
          "FORM_ERROR",
          null,
          "Inventory status is not in OUTWARD status. Only OUTWARD status inventory can be mark as return ready to be picked"
        )
      );
    }

    // change condition to bad
    // set condition_reason as reason
    // copy sale_order to sale_order_returned
    // set status
    // unset sale_order
    const updateQuery = {
      $set: {
        condition: "bad",
        condition_reason: reason.trim(),
        sale_order_returned: getObjectIdFromString(inventory.sale_order),
        status: status,
      },
      $unset: {
        sale_order: 1,
      },
    };
    const [u_err, update] = await wait(_models.Inventory.findOneAndUpdate, _models.Inventory, { serial_number }, updateQuery, { new: true });
    return res.success(update);
  }

  if (status === "return-intransit" || status === "returned") {
    if (status === "return-intransit" && inventory.status !== "return-pending") {
      return res.error(
        generateFormError(
          "FORM_ERROR",
          null,
          "Inventory status is not in Ready to be picked up status. Only Ready to be picked up status inventory can be marked as return in transit"
        )
      );
    }

    if (status === "returned" && inventory.status !== "return-intransit") {
      return res.error(
        generateFormError(
          "FORM_ERROR",
          null,
          'Inventory status is not in "In transit" status. Only In transit status inventory can be marked as returned'
        )
      );
    }

    const updateQuery = {
      $set: {
        status: status,
      },
    };
    const [u_err, update] = await wait(_models.Inventory.findOneAndUpdate, _models.Inventory, { serial_number }, updateQuery, { new: true });
    return res.success(update);
  }

  if (status === "inward") {
    if (inventory.status !== "returned") {
      return res.error(
        generateFormError("FORM_ERROR", null, 'Inventory status is not in "Returned" status. Only Returned inventory can be marked as Inward')
      );
    }
    const updateQuery = {
      $set: {
        status: status,
        condition: "good",
      },
      $unset: {
        condition_reason: 1,
      },
    };
    const [u_err, update] = await wait(_models.Inventory.findOneAndUpdate, _models.Inventory, { serial_number }, updateQuery, { new: true });
    return res.success(update);
  }

  if (status === "outward") {
    if (!["return-pending", "return-intransit", "returned"].includes(inventory.status)) {
      return res.error(generateFormError("FORM_ERROR", null, "Inventory status is not in compatible status."));
    }

    const updateQuery = {
      $set: {
        status: status,
        condition: "good",
        sale_order: getObjectIdFromString(inventory.sale_order_returned),
      },
      $unset: {
        condition_reason: 1,
        sale_order_returned: 1,
      },
    };
    const [u_err, update] = await wait(_models.Inventory.findOneAndUpdate, _models.Inventory, { serial_number }, updateQuery, { new: true });
    return res.success(update);
  }

  return res.error(generateFormError("FORM_ERROR", null, "Something went wrong"));
};

module.exports = changeInventoryStatus;
