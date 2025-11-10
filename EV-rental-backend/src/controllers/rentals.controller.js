const rentals = require("../models/rentals.model");
const renterProfiles = require("../models/renterProfiles.model");
const { generateId } = require("../utils/generateId");

// GET /api/rentals
exports.list = (req, res) => {
  const { renter_id, vehicle_id, status } = req.query;
  let data = rentals;
  if (renter_id) data = data.filter(r => r.renter_id === renter_id);
  if (vehicle_id) data = data.filter(r => r.vehicle_id === vehicle_id);
  if (status) data = data.filter(r => r.status.toLowerCase() === status.toLowerCase());
  res.json(data);
};

// GET /api/rentals/:id
exports.getById = (req, res) => {
  const rental = rentals.find(r => r.rental_id === req.params.id);
  if (!rental) return res.status(404).json({ error: "Rental not found" });
  res.json(rental);
};

// POST /api/rentals - admin/staff
exports.create = (req, res) => {
  const { reservation_id, vehicle_id, renter_id } = req.body;
  if (!reservation_id || !vehicle_id || !renter_id) {
    return res.status(400).json({ error: "reservation_id, vehicle_id, renter_id là bắt buộc" });
  }

  const rental_id = generateId("rt");
  const newRental = {
    rental_id,
    reservation_id,
    vehicle_id,
    renter_id,
    status: "Ongoing",
    start_actual: null,
    end_actual: null,
    start_battery: null,
    end_battery: null,
    start_odo: null,
    end_odo: null,
    checkout_staff_id: null,
    checkin_staff_id: null,
    estimated_cost: null,
    final_cost: null
  };
  rentals.push(newRental);
  res.status(201).json(newRental);
};

// POST /api/rentals/renter - renter tự tạo
exports.createForRenter = (req, res) => {
  const { vehicle_id } = req.body;
  if (!vehicle_id) return res.status(400).json({ error: "vehicle_id is required" });

  const renter = renterProfiles.find(r => r.user_id === req.user.user_id);
  if (!renter) return res.status(403).json({ error: "No renter profile found" });

  const rental_id = generateId("rt");
  const newRental = {
    rental_id,
    reservation_id: null,
    vehicle_id,
    renter_id: renter.renter_id,
    status: "Ongoing",
    start_actual: null,
    end_actual: null,
    start_battery: null,
    end_battery: null,
    start_odo: null,
    end_odo: null,
    checkout_staff_id: null,
    checkin_staff_id: null,
    estimated_cost: null,
    final_cost: null
  };
  rentals.push(newRental);
  res.status(201).json(newRental);
};

// PATCH /api/rentals/:id
exports.update = (req, res) => {
  const idx = rentals.findIndex(r => r.rental_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Rental not found" });
  rentals[idx] = { ...rentals[idx], ...req.body };
  res.json(rentals[idx]);
};

// PATCH /api/rentals/:id/status
exports.updateStatus = (req, res) => {
  const idx = rentals.findIndex(r => r.rental_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Rental not found" });

  const { status } = req.body;
  const valid = ["Ongoing", "Completed", "Cancelled"];
  if (!status || !valid.includes(status)) {
    return res.status(400).json({ error: `status phải thuộc: ${valid.join(", ")}` });
  }

  rentals[idx].status = status;
  res.json(rentals[idx]);
};

// DELETE /api/rentals/:id
exports.remove = (req, res) => {
  const idx = rentals.findIndex(r => r.rental_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Rental not found" });
  rentals.splice(idx, 1);
  res.status(204).end();
};
