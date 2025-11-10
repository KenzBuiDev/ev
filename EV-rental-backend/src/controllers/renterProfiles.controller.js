const renterProfiles = require("../models/renterProfiles.model");
const { generateId } = require("../utils/generateId");

// GET /api/renter-profiles?user_id=u003
exports.list = (req, res) => {
  const { user_id } = req.query;
  const data = user_id ? renterProfiles.filter(p => p.user_id === user_id) : renterProfiles;
  res.json(data);
};

// GET /api/renter-profiles/:id
exports.getById = (req, res) => {
  const item = renterProfiles.find(p => p.renter_id === req.params.id);
  if (!item) return res.status(404).json({ error: "Renter profile not found" });
  res.json(item);
};

// POST /api/renter-profiles
exports.create = (req, res) => {
  const { user_id, dob, driver_license_no, address, risk_level = "Low" } = req.body || {};
  if (!user_id || !dob || !driver_license_no || !address)
    return res.status(400).json({ error: "user_id, dob, driver_license_no, address là bắt buộc" });

  const renter_id = generateId("r");
  const created = { renter_id, user_id, dob, driver_license_no, address, risk_level };
  renterProfiles.push(created);
  res.status(201).json(created);
};

// PATCH /api/renter-profiles/:id
exports.update = (req, res) => {
  const idx = renterProfiles.findIndex(p => p.renter_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Renter profile not found" });
  renterProfiles[idx] = { ...renterProfiles[idx], ...req.body, renter_id: renterProfiles[idx].renter_id };
  res.json(renterProfiles[idx]);
};

// DELETE /api/renter-profiles/:id
exports.remove = (req, res) => {
  const idx = renterProfiles.findIndex(p => p.renter_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Renter profile not found" });
  renterProfiles.splice(idx, 1);
  res.status(204).end();
};
