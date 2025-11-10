const userDocs = require("../models/userDocs.model");
const { generateId } = require("../utils/generateId");

// GET /api/user-docs?user_id=u003&status=Pending&doc_type=ID_CARD_FRONT
exports.list = (req, res) => {
  const { user_id, status, doc_type } = req.query;
  let data = userDocs;
  if (user_id)  data = data.filter(d => d.user_id === user_id);
  if (status)   data = data.filter(d => (d.status || '').toLowerCase() === status.toLowerCase());
  if (doc_type) data = data.filter(d => (d.doc_type || '').toLowerCase() === doc_type.toLowerCase());
  res.json(data);
};

// GET /api/user-docs/:id
exports.getById = (req, res) => {
  const doc = userDocs.find(d => d.doc_id === req.params.id);
  if (!doc) return res.status(404).json({ error: "User document not found" });
  res.json(doc);
};

// POST /api/user-docs
exports.create = (req, res) => {
  const { user_id, doc_type, file_url } = req.body || {};
  if (!user_id || !doc_type || !file_url)
    return res.status(400).json({ error: "user_id, doc_type, file_url là bắt buộc" });

  const doc_id = generateId("d");
  const nowIso = new Date().toISOString();
  const created = {
    doc_id, user_id, doc_type, file_url,
    status: "Pending",
    uploaded_at: nowIso,
    verification_notes: null,
    verified_by: null,
    verified_at: null
  };
  userDocs.push(created);
  res.status(201).json(created);
};

// PATCH /api/user-docs/:id
exports.update = (req, res) => {
  const idx = userDocs.findIndex(d => d.doc_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User document not found" });
  const patch = { ...req.body }; delete patch.doc_id;
  userDocs[idx] = { ...userDocs[idx], ...patch };
  res.json(userDocs[idx]);
};

// PATCH /api/user-docs/:id/verify
exports.verify = (req, res) => {
  const idx = userDocs.findIndex(d => d.doc_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User document not found" });

  const { status, verification_notes, verified_by } = req.body || {};
  const valid = ["Verified", "Rejected", "Pending"];
  if (!status || !valid.includes(status))
    return res.status(400).json({ error: `status phải là: ${valid.join(", ")}` });

  userDocs[idx] = {
    ...userDocs[idx],
    status,
    verification_notes: verification_notes ?? userDocs[idx].verification_notes,
    verified_by: verified_by ?? userDocs[idx].verified_by,
    verified_at: new Date().toISOString()
  };
  res.json(userDocs[idx]);
};

// DELETE /api/user-docs/:id
exports.remove = (req, res) => {
  const idx = userDocs.findIndex(d => d.doc_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User document not found" });
  userDocs.splice(idx, 1);
  res.status(204).end();
};
