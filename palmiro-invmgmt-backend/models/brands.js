const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true, unique: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = {
  name: "Brand",
  schema: schema,
};
