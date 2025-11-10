const vehicles = require("../models/vehicles.model");
const { generateId } = require("../utils/generateId");

exports.list = (req, res) => {
  const { station_id, type, status } = req.query;
  let data = vehicles;
  if (station_id) data = data.filter(v => v.station_id === station_id);
  if (type) data = data.filter(v => v.type.toLowerCase() === type.toLowerCase());
  if (status) data = data.filter(v => v.status.toLowerCase() === status.toLowerCase());
  res.json(data);
};

exports.getById = (req, res) => {
  const vehicle = vehicles.find(v => v.vehicle_id === req.params.id);
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  res.json(vehicle);
};

exports.create = (req, res) => {
  const { station_id, plate_no, model, type, status, battery_percent, odometer } = req.body || {};
  if (!station_id || !plate_no || !model || !type)
    return res.status(400).json({ error: "station_id, plate_no, model, type là bắt buộc" });

  const vehicle_id = generateId("v");
  const newVehicle = {
    vehicle_id, station_id, plate_no, model, type,
    status: status || "Available",
    battery_percent: battery_percent ?? 100,
    odometer: odometer ?? 0
  };
  vehicles.push(newVehicle);
  res.status(201).json(newVehicle);
};

exports.update = (req, res) => {
  const idx = vehicles.findIndex(v => v.vehicle_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Vehicle not found" });
  vehicles[idx] = { ...vehicles[idx], ...req.body };
  res.json(vehicles[idx]);
};

exports.remove = (req, res) => {
  const idx = vehicles.findIndex(v => v.vehicle_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Vehicle not found" });
  vehicles.splice(idx, 1);
  res.status(204).end();
};
