const _ = require("lodash");

const list = async (req, res) => {
  const { label } = req.query;
  if (typeof label === "string") {
    // This is a search / lookup request
    const searchAggregateQuery = [
      {
        $match: {
          $or: [
            { code: { $regex: _.escapeRegExp(label), $options: "i" } },
            { model: { $regex: _.escapeRegExp(label), $options: "i" } },
            { desc: { $regex: _.escapeRegExp(label), $options: "i" } },
          ],
        },
      },
      {
        $limit: 20,
      },
    ];

    const [l2_err, lookups] = await wait(_models.PartCode.aggregate, _models.PartCode, searchAggregateQuery);
    return res.success(lookups);
  }
  const query = [
    { $match: {} },
    { $sort: { code: 1 } },
    {
      $lookup: {
        from: "brands",
        let: { brandId: { $toObjectId: "$brand" } },
        pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$brandId"] } } }],
        as: "brandDetails",
      },
    },
    {
      $unwind: "$brandDetails",
    },
    {
      $project: {
        code: 1,
        brand: "$brandDetails.label",
        model: 1,
        desc: 1,
        created_at: 1,
        updated_at: 1,
      },
    },
  ];
  const [l_err, partcodes] = await wait(_models.PartCode.aggregate, _models.PartCode, query);
  if (l_err) {
    console.log(l_err);
    return res.error("Something went wrong");
  }
  return res.success(partcodes);
};

module.exports = list;
