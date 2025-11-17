const mongoose = require("mongoose");

const damageReportSchema = new mongoose.Schema(
  {
    report_id: { type: String, unique: true, index: true }, // drx001
    rental_id: { type: String, default: null },             // có thể null
    vehicle_id: { type: String, required: true },           // v001
    reported_by: { type: String, required: true },          // user_id
    description: { type: String, required: true },
    estimated_cost: { type: String },                       // "100000 VND"
    status: { type: String, default: "New" },               // New/Pending Staff Review/Resolved
    created_at: { type: Date, default: Date.now },
    resolved_by: { type: String, default: null },           // user_id
    resolved_at: { type: Date, default: null },
  },
  { timestamps: false }
);

module.exports = mongoose.model("DamageReport", damageReportSchema);
