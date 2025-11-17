const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    vehicle_id: { type: String, unique: true, index: true }, // v001
    station_id: { type: String, required: true },            // st_1
    plate_no:   { type: String, required: true },
    model:      { type: String },
    type:       { type: String }, // Scooter, Bike...
    status:     { type: String, enum: ['Available', 'Rented', 'Maintenance'], default: 'Available' },
    battery_percent: { type: Number },
    odometer:        { type: Number },
    price_per_hour:  { type: Number }, // bạn đã thêm
    currency:        { type: String, default: 'VND' },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
