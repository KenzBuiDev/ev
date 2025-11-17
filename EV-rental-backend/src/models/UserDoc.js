const mongoose = require("mongoose");

const userDocSchema = new mongoose.Schema(
  {
    doc_id: { type: String, unique: true, index: true }, // d001
    user_id: { type: String, required: true },           // u003
    doc_type: { type: String, required: true },          // ID_CARD_FRONT...
    file_url: { type: String, required: true },
    status: { type: String, default: "Pending" },        // Pending/Verified/Rejected
    uploaded_at: { type: Date, default: Date.now },
    verification_notes: { type: String, default: null },
    verified_by: { type: String, default: null },        // user_id staff/admin
    verified_at: { type: Date, default: null },
  },
  { timestamps: false }
);

module.exports = mongoose.model("UserDoc", userDocSchema);
