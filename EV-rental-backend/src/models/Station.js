const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema(
  {
    station_id: { type: String, unique: true, index: true }, // st_1
    name: { type: String, required: true },
    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    status: { type: String, default: "Active" }, // Active/Inactive
  },
  { timestamps: true }
);

module.exports = mongoose.model("Station", stationSchema);
