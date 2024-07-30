const _ = require("lodash");
const list = async (req, res) => {
  let { skip: _skip, limit: _limit, search: searchTerm, mode, billDate } = req.query;
  const skip = !_skip || isNaN(parseInt(_skip)) || !/\d+/.test(_skip) ? 0 : parseInt(_skip);
  const limit = !_limit || isNaN(parseInt(_limit)) || !/\d+/.test(_limit) ? 25 : parseInt(_limit);

  const matchQuery = {};

  if (searchTerm && typeof searchTerm === "string" && searchTerm.trim()) {
    matchQuery["invoice_number"] = { $regex: _.escapeRegExp(searchTerm.trim()), $options: "i" };
  }

  if (!isNaN(new Date(billDate))) {
    const tillDate = new Date(billDate);
    tillDate.setDate(tillDate.getDate() + 1);
    matchQuery["bill_date"] = {
      $gt: new Date(billDate),
      $lt: tillDate,
    };
  }

  if (mode && typeof mode === "string") {
    const _modes = mode.split(",");
    const filteredModes = _modes.filter((e) => ["intransit", "inward", "outward"].includes(e));
    if (filteredModes.length > 0) {
      matchQuery["mode"] = { $in: filteredModes };
    }
  }

  const query = [
    { $match: matchQuery },
    { $sort: { bill_date: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "warehouses",
        localField: "warehouse",
        foreignField: "_id",
        as: "warehouseDetails",
      },
    },
    {
      $unwind: "$warehouseDetails",
    },
    {
      $addFields: {
        items: { $ifNull: ["$items", []] },
      },
    },
    {
      $lookup: {
        from: "partcodes",
        localField: "items.part_code",
        foreignField: "_id",
        as: "partcodes",
      },
    },
    {
      $lookup: {
        from: "brands",
        localField: "partcodes.brand",
        foreignField: "_id",
        as: "brands",
      },
    },
    {
      $addFields: {
        items: {
          $map: {
            input: "$items",
            in: {
              $mergeObjects: [
                "$$this",
                {
                  partcode: {
                    $arrayElemAt: [
                      "$partcodes",
                      {
                        $indexOfArray: ["$partcodes._id", "$$this.part_code"],
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        items: {
          $map: {
            input: "$items",
            in: {
              $mergeObjects: [
                "$$this",
                {
                  brand: {
                    $arrayElemAt: [
                      "$brands",
                      {
                        $indexOfArray: ["$brands._id", "$$this.partcode.brand"],
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        partcodes: 0,
        brands: 0,
      },
    },
  ];

  const [b_err, orders] = await wait(_models.Order.aggregate, _models.Order, query);
  return res.success(orders);
};

module.exports = list;
