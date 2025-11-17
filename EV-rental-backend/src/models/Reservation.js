const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    reservation_id: { type: String, unique: true, index: true },  // rsv001
    renter_id:      { type: String, required: true },             // r001
    vehicle_id:     { type: String, required: true },             // v001
    start_time:     { type: Date,   required: true },
    end_time:       { type: Date,   required: true },
    status:         { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending' },
    hold_deposit:   { type: String },     // "500000 VND" (có thể tách số & đơn vị sau)
    created_by_staff: { type: String, default: null }, // s001 hoặc null
    estimated_amount: { type: Number },  // tiền tạm tính, nếu bạn muốn lưu
    currency:         { type: String, default: 'VND' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
