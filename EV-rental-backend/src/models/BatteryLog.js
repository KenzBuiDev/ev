const mongoose = require("mongoose");

const batteryLogSchema = new mongoose.Schema(
  {
    log_id: { type: String, unique: true, index: true }, // l001
    vehicle_id: { type: String, required: true },        // v001
    timestamp: { type: Date, required: true },
    battery_percent: { type: Number },
    odometer: { type: Number },
  },
  { timestamps: false }
);

module.exports = mongoose.model("BatteryLog", batteryLogSchema);
