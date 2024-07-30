const { getObjectIdFromString } = require("../../helpers/db");

const FINANCE_RATE_OF_INTEREST = 13;

const calculateFinanceCost = async (req, res) => {
  // For all items in inward status
  // calculate day difference between current date and bill date
  // subtract credit_period
  // If number of days > 0 then set finance cost = price * 0.13 * noOfDays / 365

  const [i_err, items] = await wait(_models.Inventory.aggregate, _models.Inventory, [
    { $match: { status: "inward" } },
    { $project: { status: 1, _id: 1, bill_date: 1, credit_period: 1, price: 1 } },
  ]);

  if (i_err) {
    return res.error("Something went wrong");
  }

  const updates = [];
  for (let i = 0; i < items.length; i++) {
    const _id = getObjectIdFromString(items[i]._id);
    const start_date = new Date(items[i].bill_date);
    const current_date = new Date();
    const diffTime = current_date - start_date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const financeDays = diffDays - items[i].credit_period;
    if (diffDays < 1 || financeDays < 1) {
      continue;
    }
    const finance_cost = Math.floor(items[i].price * (FINANCE_RATE_OF_INTEREST / 100) * (financeDays / 365));
    updates.push({
      _id,
      finance_cost,
    });
  }

  for (let i = 0; i < updates.length; i++) {
    const [u_err, upd] = await wait(
      _models.Inventory.updateOne,
      _models.Inventory,
      { _id: updates[i]._id },
      { $set: { finance_cost: updates[i].finance_cost } }
    );
  }

  return res.success("ok");
};

module.exports = calculateFinanceCost;
