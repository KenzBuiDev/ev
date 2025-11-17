const mongoose = require("mongoose");

const handoverSchema = new mongoose.Schema(
  {
    handover_id: { type: String, unique: true, index: true }, // hdx001
    rental_id: { type: String, required: true },              // rt001
    kind: { type: String, required: true },                   // CHECKOUT/CHECKIN
    timestamp: { type: Date, required: true },
    battery_percent: { type: Number },
    odometer: { type: Number },
    notes: { type: String },
    staff_id: { type: String },                               // s001
  },
  { timestamps: false }
);

module.exports = mongoose.model("Handover", handoverSchema);
