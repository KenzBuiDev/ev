const damageReports = require("../models/damageReports.model");
const { generateId } = require("../utils/generateId");

// GET /api/damage-reports?status=Pending Staff Review&vehicle_id=v001
exports.list = (req, res) => {
  const { rental_id, vehicle_id, reported_by, status } = req.query;
  let data = damageReports;
  if (rental_id) data = data.filter(r => r.rental_id === rental_id);
  if (vehicle_id) data = data.filter(r => r.vehicle_id === vehicle_id);
  if (reported_by) data = data.filter(r => r.reported_by === reported_by);
  if (status) data = data.filter(r => (r.status || '').toLowerCase() === status.toLowerCase());
  res.json(data);
};

// GET /api/damage-reports/:id
exports.getById = (req, res) => {
  const report = damageReports.find(r => r.report_id === req.params.id);
  if (!report) return res.status(404).json({ error: "Damage report not found" });
  res.json(report);
};

// POST /api/damage-reports
exports.create = (req, res) => {
  const { rental_id, vehicle_id, reported_by, description, estimated_cost, status, created_at } = req.body || {};
  if (!vehicle_id || !reported_by || !description)
    return res.status(400).json({ error: "vehicle_id, reported_by, description là bắt buộc" });

  const allowedStatus = ["New", "Pending Staff Review", "Resolved"];
  if (status && !allowedStatus.includes(status))
    return res.status(400).json({ error: `status phải thuộc: ${allowedStatus.join(", ")}` });

  const report_id = generateId("drx");
  const created = {
    report_id,
    rental_id: rental_id || null,
    vehicle_id,
    reported_by,
    description,
    estimated_cost: estimated_cost || "0 VND",
    status: status || "New",
    created_at: created_at || new Date().toISOString(),
    resolved_by: null,
    resolved_at: null
  };
  damageReports.push(created);
  res.status(201).json(created);
};

// PATCH /api/damage-reports/:id
exports.update = (req, res) => {
  const idx = damageReports.findIndex(r => r.report_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Damage report not found" });
  damageReports[idx] = { ...damageReports[idx], ...req.body };
  res.json(damageReports[idx]);
};

// PATCH /api/damage-reports/:id/resolve
exports.resolve = (req, res) => {
  const idx = damageReports.findIndex(r => r.report_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Damage report not found" });

  const { resolved_by, notes } = req.body || {};
  if (!resolved_by)
    return res.status(400).json({ error: "resolved_by là bắt buộc khi đánh dấu Resolved" });

  damageReports[idx] = {
    ...damageReports[idx],
    status: "Resolved",
    resolved_by,
    resolved_at: new Date().toISOString(),
    resolution_notes: notes || null
  };
  res.json(damageReports[idx]);
};

// DELETE /api/damage-reports/:id
exports.remove = (req, res) => {
  const idx = damageReports.findIndex(r => r.report_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Damage report not found" });
  damageReports.splice(idx, 1);
  res.status(204).end();
};
