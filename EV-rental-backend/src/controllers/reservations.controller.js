const reservations = require("../models/reservations.model");
const { generateId } = require("../utils/generateId");

// GET /api/reservations?status=Pending&renter_id=r001
exports.list = (req, res) => {
  const { renter_id, vehicle_id, status, created_by_staff } = req.query;
  let data = reservations;
  if (renter_id) data = data.filter(r => r.renter_id === renter_id);
  if (vehicle_id) data = data.filter(r => r.vehicle_id === vehicle_id);
  if (status) data = data.filter(r => r.status.toLowerCase() === status.toLowerCase());
  if (created_by_staff) data = data.filter(r => r.created_by_staff === created_by_staff);
  res.json(data);
};

// GET /api/reservations/:id
exports.getById = (req, res) => {
  const item = reservations.find(r => r.reservation_id === req.params.id);
  if (!item) return res.status(404).json({ error: "Reservation not found" });
  res.json(item);
};

// POST /api/reservations
exports.create = (req, res) => {
  const { renter_id, vehicle_id, start_time, end_time, status, hold_deposit, created_by_staff } = req.body || {};
  if (!renter_id || !vehicle_id || !start_time || !end_time)
    return res.status(400).json({ error: "renter_id, vehicle_id, start_time, end_time là bắt buộc" });

  const reservation_id = generateId("rsv");
  const created = {
    reservation_id, renter_id, vehicle_id, start_time, end_time,
    status: status || "Pending",
    hold_deposit: hold_deposit || "500000 VND",
    created_by_staff: created_by_staff || null
  };
  reservations.push(created);
  res.status(201).json(created);
};

// PATCH /api/reservations/:id
exports.update = (req, res) => {
  const idx = reservations.findIndex(r => r.reservation_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Reservation not found" });
  reservations[idx] = { ...reservations[idx], ...req.body };
  res.json(reservations[idx]);
};

// PATCH /api/reservations/:id/status
exports.updateStatus = (req, res) => {
  const idx = reservations.findIndex(r => r.reservation_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Reservation not found" });
  const { status } = req.body || {};
  const valid = ["Pending", "Confirmed", "Cancelled", "Completed"];
  if (!status || !valid.includes(status))
    return res.status(400).json({ error: `Trạng thái phải là: ${valid.join(", ")}` });
  reservations[idx].status = status;
  res.json(reservations[idx]);
};

// DELETE /api/reservations/:id
exports.remove = (req, res) => {
  const idx = reservations.findIndex(r => r.reservation_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Reservation not found" });
  reservations.splice(idx, 1);
  res.status(204).end();
};
