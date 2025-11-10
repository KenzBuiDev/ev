const rentalPhotos = require("../models/rentalPhotos.model");
const { generateId } = require("../utils/generateId");

// GET /api/rental-photos?rental_id=rt001&stage=CHECKIN&taken_by=u002
exports.list = (req, res) => {
  const { rental_id, stage, taken_by } = req.query;
  let data = rentalPhotos;
  if (rental_id) data = data.filter(p => p.rental_id === rental_id);
  if (stage)     data = data.filter(p => (p.stage || '').toUpperCase() === stage.toUpperCase());
  if (taken_by)  data = data.filter(p => p.taken_by === taken_by);
  res.json(data);
};

// GET /api/rental-photos/:id
exports.getById = (req, res) => {
  const item = rentalPhotos.find(p => p.photo_id === req.params.id);
  if (!item) return res.status(404).json({ error: "Rental photo not found" });
  res.json(item);
};

// POST /api/rental-photos
exports.create = (req, res) => {
  const { rental_id, stage, url, notes, taken_by, taken_at } = req.body || {};
  if (!rental_id || !stage || !url || !taken_by)
    return res.status(400).json({ error: "rental_id, stage, url, taken_by là bắt buộc" });

  const allowed = ["CHECKOUT", "CHECKIN", "DAMAGE", "OTHER"];
  if (!allowed.includes(stage))
    return res.status(400).json({ error: `stage phải thuộc: ${allowed.join(", ")}` });

  const photo_id = generateId("pfx");
  const created = {
    photo_id, rental_id, stage, url,
    notes: notes || "",
    taken_by,
    taken_at: taken_at || new Date().toISOString()
  };
  rentalPhotos.push(created);
  res.status(201).json(created);
};

// PATCH /api/rental-photos/:id
exports.update = (req, res) => {
  const idx = rentalPhotos.findIndex(p => p.photo_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Rental photo not found" });

  const patch = { ...req.body };
  if (patch.stage) {
    const allowed = ["CHECKOUT", "CHECKIN", "DAMAGE", "OTHER"];
    if (!allowed.includes(patch.stage))
      return res.status(400).json({ error: `stage phải thuộc: ${allowed.join(", ")}` });
  }
  rentalPhotos[idx] = { ...rentalPhotos[idx], ...patch };
  res.json(rentalPhotos[idx]);
};

// DELETE /api/rental-photos/:id
exports.remove = (req, res) => {
  const idx = rentalPhotos.findIndex(p => p.photo_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Rental photo not found" });
  rentalPhotos.splice(idx, 1);
  res.status(204).end();
};
