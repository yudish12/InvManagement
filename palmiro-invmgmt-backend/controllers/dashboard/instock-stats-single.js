const { getObjectIdFromString } = require("../../helpers/db");

const instockStatsSingle = async (req, res) => {
  const { part_code, brand } = req.body;

  if (
    typeof part_code !== "string" ||
    part_code.length < 1 ||
    typeof brand !== "string" ||
    brand.length < 1 ||
    !/[0-9A-Fa-f]{24}/g.test(part_code) ||
    !/[0-9A-Fa-f]{24}/g.test(brand)
  ) {
    return res.error("Invalid access");
  }

  const pc_id = getObjectIdFromString(part_code);
  const brand_id = getObjectIdFromString(brand);

  const aggregateQuery = [
    {
      $match: {
        part_code: pc_id,
        brand: brand_id,
        status: "inward",
        condition: "good",
      },
    },
    {
      $project: {
        _id: 1,
        part_code: 1,
        brand: 1,
        warehouse: 1,
        price: 1,
        finance_cost: 1,
        total_cost: { $add: ["$price", "$finance_cost"] },
      },
    },
    {
      $group: {
        _id: {
          warehouse: "$warehouse",
          part_code: "$part_code",
          brand: "$brand",
        },
        count: {
          $sum: 1,
        },
        averagePrice: {
          $avg: "$price",
        },
        averageFinanceCostPrice: {
          $avg: "$total_cost",
        },
      },
    },
    {
      $lookup: {
        from: "warehouses",
        localField: "_id.warehouse",
        foreignField: "_id",
        as: "warehouse",
      },
    },
    {
      $unwind: "$warehouse",
    },
    {
      $lookup: {
        from: "partcodes",
        localField: "_id.part_code",
        foreignField: "_id",
        as: "partcode",
      },
    },
    {
      $unwind: "$partcode",
    },
    {
      $lookup: {
        from: "brands",
        localField: "_id.brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    {
      $unwind: "$brand",
    },
    {
      $sort: {
        "warehouse.label": 1,
        "brand.label": 1,
        "partcode.model": 1,
        "partcode.code": 1,
      },
    },
  ];
  const [s_err, stats] = await wait(_models.Inventory.aggregate, _models.Inventory, aggregateQuery);

  return res.success(stats);
};

module.exports = instockStatsSingle;
