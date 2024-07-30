const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    account: String, // palmiro, qvent, trioline
    invoice_number: String,
    po_number: String,
    bill_date: Date,
    mode: String, // intransit, inward, outward
    docket_number: String,
    inward_date: Date,
    outward_date: Date,
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
    credit_period: Number, // no. of days
    comments: String,
    items: [
      {
        part_code: { type: mongoose.Schema.Types.ObjectId, ref: "PartCode" },
        serial_numbers: [String],
        price: Number,
        qty: Number,
        warranty_period: Number, // no. of months
      },
    ],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = {
  name: "Order",
  schema: schema,
};
