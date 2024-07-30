const mongoose = require("mongoose");
const _ = require("lodash");

const getObjectIdFromString = (str) => {
  return new mongoose.Types.ObjectId(str);
};

const getLookupAggregateQuery = (label, field = "label") => {
  return [
    {
      $match: {
        $or: [{ [field]: { $regex: _.escapeRegExp(label), $options: "i" } }],
      },
    },
    {
      $limit: 20,
    },
  ];
};

module.exports = {
  getObjectIdFromString,
  getLookupAggregateQuery,
};
