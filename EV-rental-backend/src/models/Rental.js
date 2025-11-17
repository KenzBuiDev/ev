const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema(
  {
    rental_id: { type: String, unique: true, index: true }, // rt001
    reservation_id: { type: String, required: true },       // rsv001
    vehicle_id: { type: String, required: true },           // v001
    renter_id: { type: String, required: true },            // r001

    start_actual: { type: Date, required: true },
    end_actual: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed", "Cancelled"],
      default: "Completed",
    },

    start_battery: { type: Number },
    end_battery: { type: Number },
    start_odo: { type: Number },
    end_odo: { type: Number },

    checkout_staff_id: { type: String },
    checkin_staff_id: { type: String },

    estimated_cost: { type: String }, // "150000 VND"
    final_cost: { type: String },     // "145000 VND"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rental", rentalSchema);
