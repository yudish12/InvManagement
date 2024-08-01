const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    serial_number: { type: String, unique: true },
    part_code: { type: mongoose.Schema.Types.ObjectId, ref: "PartCode" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    price: Number,
    selling_price: Number,
    warranty_inward: Number, // no. of months
    warranty_outward: Number, // no. of months
    purchase_order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    sale_order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    condition: { type: String, enum: ["good", "bad"], default: "good" },
    condition_reason: String,
    status: { type: String, default: "inward" },
    sale_order_returned: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
    bill_date: Date,
    credit_period: Number,
    finance_cost: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);``

schema.index(
  { status: 1, condition: 1, part_code: 1, brand: 1, warehouse: 1, price: 1, finance_cost: 1, _id: 1 },
  { background: true, name: "dashboard-instock-stats" }
);

schema.index({ status: 1, _id: 1, bill_date: 1, credit_period: 1, price: 1 }, { background: true, name: "calculate-finance-cost" });

module.exports = {
  name: "Inventory",
  schema: schema,
};
