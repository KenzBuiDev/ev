const mongoose = require("mongoose");

const rentalPhotoSchema = new mongoose.Schema(
  {
    photo_id: { type: String, unique: true, index: true }, // pfx001
    rental_id: { type: String, required: true },           // rt001
    stage: { type: String, required: true },               // CHECKOUT/CHECKIN
    url: { type: String, required: true },
    notes: { type: String },
    taken_by: { type: String },                            // user_id
    taken_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("RentalPhoto", rentalPhotoSchema);
