const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    user_id: { type: String, unique: true, index: true }, // giữ lại mã u001 nếu bạn muốn
    full_name: { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    phone:     { type: String },
    role:      { type: String, enum: ['admin', 'staff', 'renter'], required: true },
    password:  { type: String },       // nếu bạn lưu plain cho mock
    passwordHash: { type: String },    // nếu có bcrypt
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('User', userSchema);
