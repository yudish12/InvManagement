const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    param: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = {
  name: "Config",
  schema: schema,
};
