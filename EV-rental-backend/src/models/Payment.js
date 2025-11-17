const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    payment_id: { type: String, unique: true, index: true }, // px001
    rental_id: { type: String, required: true },             // rt001
    type: { type: String, required: true },                  // Rental Fee/Deposit/Fine...
    amount: { type: String, required: true },                // "145000 VND"
    method: { type: String, required: true },                // Cash/Transfer/Card
    provider_ref: { type: String },                          // mã giao dịch VNPay/Bank
    status: { type: String, default: "Pending" },            // Pending/Success/Failed/Refunded
    paid_at: { type: Date },
    handled_by: { type: String },                            // user_id
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
