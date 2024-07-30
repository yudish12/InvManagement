const { getLookupAggregateQuery } = require("../../helpers/db");

const list = async (req, res) => {
  const { label } = req.query;
  if (typeof label === "string") {
    // This is a search / lookup request
    const searchAggregateQuery = getLookupAggregateQuery(label.trim());

    const [l2_err, lookups] = await wait(_models.Warehouse.aggregate, _models.Warehouse, searchAggregateQuery);
    return res.success(lookups);
  }
  const query = [{ $match: {} }, { $sort: { label: 1 } }];
  const [b_err, warehouses] = await wait(_models.Warehouse.aggregate, _models.Warehouse, query);
  return res.success(warehouses);
};

module.exports = list;
