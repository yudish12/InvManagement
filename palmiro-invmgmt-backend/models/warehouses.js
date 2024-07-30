const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true, unique: true },
    desc: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = {
  name: "Warehouse",
  schema: schema,
};
