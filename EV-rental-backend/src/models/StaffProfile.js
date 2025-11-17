const mongoose = require("mongoose");

const staffProfileSchema = new mongoose.Schema(
  {
    staff_id: { type: String, unique: true, index: true }, // s001
    user_id: { type: String, required: true },             // u002
    station_id: { type: String, required: true },          // st_1
    position: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StaffProfile", staffProfileSchema);
