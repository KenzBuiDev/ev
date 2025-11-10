const batteryLogs = require("../models/batteryLogs.model");
const { generateId } = require("../utils/generateId");

// GET /api/battery-logs?vehicle_id=v001
exports.list = (req, res) => {
  const { vehicle_id } = req.query;
  const data = vehicle_id ? batteryLogs.filter(l => l.vehicle_id === vehicle_id) : batteryLogs;
  res.json(data);
};

// GET /api/battery-logs/:id
exports.getById = (req, res) => {
  const log = batteryLogs.find(l => l.log_id === req.params.id);
  if (!log) return res.status(404).json({ error: "Battery log not found" });
  res.json(log);
};

// POST /api/battery-logs
exports.create = (req, res) => {
  const { vehicle_id, timestamp, battery_percent, odometer } = req.body || {};
  if (!vehicle_id || battery_percent == null)
    return res.status(400).json({ error: "vehicle_id, battery_percent là bắt buộc" });

  const log_id = generateId("l");
  const created = {
    log_id,
    vehicle_id,
    timestamp: timestamp || new Date().toISOString(),
    battery_percent,
    odometer: odometer ?? 0
  };
  batteryLogs.push(created);
  res.status(201).json(created);
};

// PATCH /api/battery-logs/:id
exports.update = (req, res) => {
  const idx = batteryLogs.findIndex(l => l.log_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Battery log not found" });
  batteryLogs[idx] = { ...batteryLogs[idx], ...req.body };
  res.json(batteryLogs[idx]);
};

// DELETE /api/battery-logs/:id
exports.remove = (req, res) => {
  const idx = batteryLogs.findIndex(l => l.log_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Battery log not found" });
  batteryLogs.splice(idx, 1);
  res.status(204).end();
};
