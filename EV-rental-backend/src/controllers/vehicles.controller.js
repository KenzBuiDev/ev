// src/controllers/vehicles.controller.js
const Vehicle = require("../models/Vehicle");

// GET /api/vehicles
exports.getAll = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().lean();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/vehicles/:id (vehicle_id)
exports.getById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      vehicle_id: req.params.id,
    }).lean();
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/vehicles (admin/staff)
exports.create = async (req, res) => {
  try {
    const data = req.body;
    const count = await Vehicle.countDocuments();
    data.vehicle_id =
      data.vehicle_id || `v${(count + 1).toString().padStart(3, "0")}`;
    const doc = await Vehicle.create(data);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/vehicles/:id
exports.update = async (req, res) => {
  try {
    const doc = await Vehicle.findOneAndUpdate(
      { vehicle_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Vehicle not found" });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
