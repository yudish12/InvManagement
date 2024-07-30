const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, required: true },
    model: { type: String, required: true },
    desc: { type: String, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = {
  name: "PartCode",
  schema: schema,
};
