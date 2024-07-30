const { getLookupAggregateQuery } = require("../../helpers/db");

const list = async (req, res) => {
  const { label } = req.query;
  if (typeof label === "string") {
    // This is a search / lookup request
    const searchAggregateQuery = getLookupAggregateQuery(label.trim());

    const [l2_err, lookups] = await wait(_models.Brand.aggregate, _models.Brand, searchAggregateQuery);
    return res.success(lookups);
  }
  const query = [{ $match: {} }, { $sort: { label: 1 } }];
  const [b_err, brands] = await wait(_models.Brand.aggregate, _models.Brand, query);
  return res.success(brands);
};

module.exports = list;
