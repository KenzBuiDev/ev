const verifications = require("../models/verifications.model");
const { generateId } = require("../utils/generateId");

// GET /api/verifications?doc_id=d001&staff_id=s001&result=Approved
exports.list = (req, res) => {
  const { doc_id, staff_id, result } = req.query;
  let data = verifications;
  if (doc_id) data = data.filter(v => v.doc_id === doc_id);
  if (staff_id) data = data.filter(v => v.staff_id === staff_id);
  if (result) data = data.filter(v => v.result.toLowerCase() === result.toLowerCase());
  res.json(data);
};

// GET /api/verifications/:id
exports.getById = (req, res) => {
  const verification = verifications.find(v => v.verification_id === req.params.id);
  if (!verification) return res.status(404).json({ error: "Verification not found" });
  res.json(verification);
};

// POST /api/verifications
exports.create = (req, res) => {
  const { doc_id, staff_id, result, notes } = req.body || {};
  if (!doc_id || !staff_id || !result)
    return res.status(400).json({ error: "doc_id, staff_id, result là bắt buộc" });

  const verification_id = generateId("vfx");
  const created = {
    verification_id, doc_id, staff_id, result, notes: notes || "",
    verified_at: new Date().toISOString()
  };
  verifications.push(created);
  res.status(201).json(created);
};

// PATCH /api/verifications/:id
exports.update = (req, res) => {
  const idx = verifications.findIndex(v => v.verification_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Verification not found" });
  verifications[idx] = { ...verifications[idx], ...req.body };
  res.json(verifications[idx]);
};

// DELETE /api/verifications/:id
exports.remove = (req, res) => {
  const idx = verifications.findIndex(v => v.verification_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Verification not found" });
  verifications.splice(idx, 1);
  res.status(204).end();
};
