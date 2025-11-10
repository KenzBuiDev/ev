let reservations = [
  { reservation_id: "rsv001", renter_id: "r001", vehicle_id: "v001", start_time: "2025-11-05T08:00:00Z", end_time: "2025-11-05T10:00:00Z", status: "Confirmed", hold_deposit: "500000 VND", created_by_staff: null },
  { reservation_id: "rsv002", renter_id: "r002", vehicle_id: "v002", start_time: "2025-11-06T14:00:00Z", end_time: "2025-11-06T16:30:00Z", status: "Pending",   hold_deposit: "500000 VND", created_by_staff: "s001" }
];
module.exports = reservations;
