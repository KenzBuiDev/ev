const mongoose = require("mongoose");

const vehicleImageSchema = new mongoose.Schema(
  {
    image_id: { type: String, unique: true, index: true }, // i001
    vehicle_id: { type: String, required: true },          // v001
    url: { type: String, required: true },
    caption: { type: String },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("VehicleImage", vehicleImageSchema);
