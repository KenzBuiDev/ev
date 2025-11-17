const mongoose = require("mongoose");

const renterProfileSchema = new mongoose.Schema(
  {
    renter_id: { type: String, unique: true, index: true }, // r001
    user_id: { type: String, required: true },              // u003
    dob: { type: Date },
    driver_license_no: { type: String },
    address: { type: String },
    risk_level: { type: String, default: "Low" },           // Low/Medium/High
  },
  { timestamps: true }
);

module.exports = mongoose.model("RenterProfile", renterProfileSchema);
