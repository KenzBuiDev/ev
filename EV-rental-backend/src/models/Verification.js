const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    verification_id: { type: String, unique: true, index: true }, // vfx001
    doc_id: { type: String, required: true },                     // d001
    staff_id: { type: String, required: true },                   // s001
    result: { type: String, required: true },                     // Approved/Rejected
    notes: { type: String },
    verified_at: { type: Date, required: true },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Verification", verificationSchema);
