const _ = require("lodash");

const list = async (req, res) => {
  let { skip, limit, search } = req.query;

  if (!isNaN(parseInt(skip)) && /\d+/.test(skip)) {
    skip = parseInt(skip);
  } else {
    skip = 0;
  }

  if (!isNaN(parseInt(limit)) && /\d+/.test(limit)) {
    limit = parseInt(limit);
  } else {
    limit = 25;
  }

  const matchQuery = {};

  if (typeof search === "string" && search.trim()) {
    matchQuery["serial_number"] = { $regex: _.escapeRegExp(search.trim()), $options: "i" };
  }

  const query = [
    { $match: matchQuery },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "partcodes",
        localField: "part_code",
        foreignField: "_id",
        as: "partcode",
      },
    },
    {
      $unwind: "$partcode",
    },
    {
      $lookup: {
        from: "warehouses",
        localField: "warehouse",
        foreignField: "_id",
        as: "warehouse",
      },
    },
    {
      $unwind: "$warehouse",
    },
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    {
      $unwind: "$brand",
    },
    {
      $lookup: {
        from: "orders",
        localField: "purchase_order",
        foreignField: "_id",
        as: "purchase_order",
      },
    },
    {
      $unwind: "$purchase_order",
    },
    {
      $lookup: {
        from: "orders",
        localField: "sale_order",
        foreignField: "_id",
        as: "sale_order",
      },
    },
    {
      $unwind: {
        path: "$sale_order",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "sale_order_returned",
        foreignField: "_id",
        as: "sale_order_returned",
      },
    },
    {
      $unwind: {
        path: "$sale_order_returned",
        preserveNullAndEmptyArrays: true,
      },
    },
    { $sort: { created_at: 1 } },
  ];
  const [c_err, count] = await wait(_models.Inventory.countDocuments, _models.Inventory, matchQuery);
  const [b_err, inventory] = await wait(_models.Inventory.aggregate, _models.Inventory, query);
  return res.success({
    count,
    items: inventory,
  });
};

module.exports = list;
