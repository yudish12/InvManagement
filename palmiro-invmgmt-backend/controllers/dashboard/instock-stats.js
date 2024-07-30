const instockStats = async (req, res) => {
  const aggregateQuery = [
    {
      $match: {
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
        "brand.label": 1,
        "partcode.model": 1,
        "partcode.code": 1,
      },
    },
  ];
  const [s_err, stats] = await wait(_models.Inventory.aggregate, _models.Inventory, aggregateQuery);

  return res.success(stats);
};

module.exports = instockStats;
