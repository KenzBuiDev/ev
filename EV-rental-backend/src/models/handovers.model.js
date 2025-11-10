let handovers = [
  { handover_id: "hdx001", rental_id: "rt001", kind: "CHECKOUT", timestamp: "2025-11-05T08:05:00Z", battery_percent: 83, odometer: 1255, notes: "Kiểm tra kỹ tình trạng xe trước khi giao.", staff_id: "s001" },
  { handover_id: "hdx002", rental_id: "rt001", kind: "CHECKIN",  timestamp: "2025-11-05T09:55:00Z", battery_percent: 35, odometer: 1355, notes: "Xe về trạm an toàn, không có hư hỏng mới.",     staff_id: "s001" }
];
module.exports = handovers;
