const vehicleImages = require("../models/vehicleImages.model");
const { generateId } = require("../utils/generateId");

// GET /api/vehicle-images?vehicle_id=v001
exports.list = (req, res) => {
  const { vehicle_id } = req.query;
  const data = vehicle_id ? vehicleImages.filter(i => i.vehicle_id === vehicle_id) : vehicleImages;
  res.json(data);
};

// GET /api/vehicle-images/:id
exports.getById = (req, res) => {
  const image = vehicleImages.find(i => i.image_id === req.params.id);
  if (!image) return res.status(404).json({ error: "Vehicle image not found" });
  res.json(image);
};

// POST /api/vehicle-images
exports.create = (req, res) => {
  const { vehicle_id, url, caption } = req.body || {};
  if (!vehicle_id || !url) return res.status(400).json({ error: "vehicle_id, url là bắt buộc" });

  const image_id = generateId("i");
  const created_at = new Date().toISOString();
  const created = { image_id, vehicle_id, url, caption: caption || "", created_at };
  vehicleImages.push(created);
  res.status(201).json(created);
};

// PATCH /api/vehicle-images/:id
exports.update = (req, res) => {
  const idx = vehicleImages.findIndex(i => i.image_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Vehicle image not found" });
  vehicleImages[idx] = { ...vehicleImages[idx], ...req.body };
  res.json(vehicleImages[idx]);
};

// DELETE /api/vehicle-images/:id
exports.remove = (req, res) => {
  const idx = vehicleImages.findIndex(i => i.image_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Vehicle image not found" });
  vehicleImages.splice(idx, 1);
  res.status(204).end();
};
