const staffProfiles = require("../models/staffProfiles.model");
const { generateId } = require("../utils/generateId");

// GET /api/staff-profiles?station_id=st_1&user_id=u002
exports.list = (req, res) => {
  const { station_id, user_id } = req.query;
  let data = staffProfiles;
  if (station_id) data = data.filter(s => s.station_id === station_id);
  if (user_id) data = data.filter(s => s.user_id === user_id);
  res.json(data);
};

// GET /api/staff-profiles/:id
exports.getById = (req, res) => {
  const staff = staffProfiles.find(s => s.staff_id === req.params.id);
  if (!staff) return res.status(404).json({ error: "Staff profile not found" });
  res.json(staff);
};

// POST /api/staff-profiles
exports.create = (req, res) => {
  const { user_id, station_id, position } = req.body || {};
  if (!user_id || !station_id || !position)
    return res.status(400).json({ error: "user_id, station_id, position là bắt buộc" });

  const staff_id = generateId("s");
  const created = { staff_id, user_id, station_id, position };
  staffProfiles.push(created);
  res.status(201).json(created);
};

// PATCH /api/staff-profiles/:id
exports.update = (req, res) => {
  const idx = staffProfiles.findIndex(s => s.staff_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Staff profile not found" });
  staffProfiles[idx] = { ...staffProfiles[idx], ...req.body, staff_id: staffProfiles[idx].staff_id };
  res.json(staffProfiles[idx]);
};

// DELETE /api/staff-profiles/:id
exports.remove = (req, res) => {
  const idx = staffProfiles.findIndex(s => s.staff_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Staff profile not found" });
  staffProfiles.splice(idx, 1);
  res.status(204).end();
};
