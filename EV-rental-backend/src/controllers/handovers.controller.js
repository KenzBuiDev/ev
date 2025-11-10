const handovers = require("../models/handovers.model");
const { generateId } = require("../utils/generateId");

// GET /api/handovers?rental_id=rt001&kind=CHECKOUT&staff_id=s001
exports.list = (req, res) => {
  const { rental_id, kind, staff_id } = req.query;
  let data = handovers;
  if (rental_id) data = data.filter(h => h.rental_id === rental_id);
  if (kind) data = data.filter(h => (h.kind || '').toUpperCase() === kind.toUpperCase());
  if (staff_id) data = data.filter(h => h.staff_id === staff_id);
  res.json(data);
};

// GET /api/handovers/:id
exports.getById = (req, res) => {
  const h = handovers.find(x => x.handover_id === req.params.id);
  if (!h) return res.status(404).json({ error: "Handover not found" });
  res.json(h);
};

// POST /api/handovers
exports.create = (req, res) => {
  const { rental_id, kind, battery_percent, odometer, notes, staff_id, timestamp } = req.body || {};
  if (!rental_id || !kind || !staff_id)
    return res.status(400).json({ error: "rental_id, kind, staff_id là bắt buộc" });

  const allowedKinds = ["CHECKOUT", "CHECKIN"];
  if (!allowedKinds.includes(kind))
    return res.status(400).json({ error: `kind phải thuộc: ${allowedKinds.join(", ")}` });

  const handover_id = generateId("hdx");
  const created = {
    handover_id,
    rental_id,
    kind,
    timestamp: timestamp || new Date().toISOString(),
    battery_percent: battery_percent ?? null,
    odometer: odometer ?? null,
    notes: notes || "",
    staff_id
  };
  handovers.push(created);
  res.status(201).json(created);
};

// PATCH /api/handovers/:id
exports.update = (req, res) => {
  const idx = handovers.findIndex(h => h.handover_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Handover not found" });

  const patch = { ...req.body };
  if (patch.kind) {
    const allowedKinds = ["CHECKOUT", "CHECKIN"];
    if (!allowedKinds.includes(patch.kind))
      return res.status(400).json({ error: `kind phải thuộc: ${allowedKinds.join(", ")}` });
  }
  handovers[idx] = { ...handovers[idx], ...patch };
  res.json(handovers[idx]);
};

// DELETE /api/handovers/:id
exports.remove = (req, res) => {
  const idx = handovers.findIndex(h => h.handover_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Handover not found" });
  handovers.splice(idx, 1);
  res.status(204).end();
};
