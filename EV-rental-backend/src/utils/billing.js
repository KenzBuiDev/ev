// src/utils/billing.js
const Vehicle = require("../models/Vehicle");

/**
 * Tính báo giá thuê xe theo khoảng thời gian
 * @param {Object} param0
 * @param {string} param0.vehicle_id
 * @param {string} param0.start_time - ISO string
 * @param {string} param0.end_time - ISO string
 * @returns {Object} quote
 */
async function quoteByTimeRange({ vehicle_id, start_time, end_time }) {
    const vehicle = await Vehicle.findOne({ vehicle_id }).lean();
    if (!vehicle) throw new Error("Không tìm thấy xe");
    const s = new Date(start_time);
    const e = new Date(end_time);
    if (isNaN(+s) || isNaN(+e)) throw new Error("Thời gian không hợp lệ");
    let hours = (e - s) / (1000 * 60 * 60);
    if (hours <= 0) hours += 24; // qua ngày hôm sau
    hours = Math.ceil(hours * 10) / 10; // làm tròn 1 số thập phân
    const price_per_hour = Number(vehicle.price_per_hour || 0);
    const amount = Math.round(hours * price_per_hour);
    return {
        vehicle_id,
        hours,
        price_per_hour,
        billing_unit: "giờ",
        currency: "VNĐ",
        amount,
    };
}

module.exports = { quoteByTimeRange };
