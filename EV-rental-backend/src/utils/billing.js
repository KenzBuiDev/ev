// src/utils/billing.js
const vehicles = require("../models/vehicles.model");

// Làm tròn lên từng giờ (có thể đổi sang 15' nếu muốn)
function ceilHours(ms) {
  const minutes = Math.ceil(ms / 60000);
  return Math.ceil(minutes / 60);
}

exports.quoteByTimeRange = ({ vehicle_id, start_time, end_time }) => {
  const v = vehicles.find(x => x.vehicle_id === vehicle_id);
  if (!v) throw new Error("Vehicle not found");

  const start = new Date(start_time);
  const end = new Date(end_time);
  if (isNaN(start) || isNaN(end) || end <= start) throw new Error("Invalid time range");

  const hours = ceilHours(end - start);
  const unit = v.price_per_hour || 0;
  const amount = hours * unit;

  return {
    hours,
    price_per_hour: unit,
    billing_unit: v.billing_unit || "hour",
    currency: v.currency || "VND",
    amount, // VND
  };
};

// Giữ hàm estimateRentalCost (nếu trước đó đã có) — optional
exports.estimateRentalCost = ({ vehicle_id, start, end }) =>
  exports.quoteByTimeRange({ vehicle_id, start_time: start, end_time: end });
