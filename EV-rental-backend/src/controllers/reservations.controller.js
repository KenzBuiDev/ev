// src/controllers/reservations.controller.js
const Reservation = require("../models/Reservation");
const Vehicle = require("../models/Vehicle");

// tính tiền
function calcQuote(vehicle, start_time, end_time) {
  const start = new Date(start_time);
  let end = new Date(end_time);
  if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  const ms = end - start;
  const hours = Math.ceil(ms / 3600000);
  const price = Number(vehicle.price_per_hour || 0);
  const amount = hours * price;
  return { hours, amount, price_per_hour: price };
}

// GET /api/reservations/:id
exports.getById = async (req, res) => {
  try {
    const r = await Reservation.findOne({
      reservation_id: req.params.id,
    }).lean();
    if (!r) return res.status(404).json({ message: "Reservation not found" });
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/reservations
exports.create = async (req, res) => {
  try {
    const { vehicle_id, start_time, end_time } = req.body;
    const vehicle = await Vehicle.findOne({ vehicle_id }).lean();
    if (!vehicle)
      return res.status(404).json({ message: "Vehicle not found" });

    const { hours, amount } = calcQuote(vehicle, start_time, end_time);

    const count = await Reservation.countDocuments();
    const reservation_id = `rsv${(count + 1)
      .toString()
      .padStart(3, "0")}`;

    const renter_id =
      req.user?.renter_id || req.user?.user_id || "r001"; // tuỳ cách map của bạn

    const doc = await Reservation.create({
      reservation_id,
      renter_id,
      vehicle_id,
      start_time,
      end_time,
      status: "Confirmed",
      hold_deposit: "500000 VND",
      created_by_staff: req.user?.role === "staff" ? req.user.user_id : null,
      estimated_amount: amount,
      currency: "VND",
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
