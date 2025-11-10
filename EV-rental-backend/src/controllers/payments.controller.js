const payments = require("../models/payments.model");
const { generateId } = require("../utils/generateId");

// GET /api/payments?rental_id=rt001&type=Rental Fee&status=Success
exports.list = (req, res) => {
  const { rental_id, type, status, handled_by } = req.query;
  let data = payments;
  if (rental_id)  data = data.filter(p => p.rental_id === rental_id);
  if (type)       data = data.filter(p => p.type.toLowerCase() === type.toLowerCase());
  if (status)     data = data.filter(p => p.status.toLowerCase() === status.toLowerCase());
  if (handled_by) data = data.filter(p => p.handled_by === handled_by);
  res.json(data);
};

// GET /api/payments/:id
exports.getById = (req, res) => {
  const pay = payments.find(p => p.payment_id === req.params.id);
  if (!pay) return res.status(404).json({ error: "Payment not found" });
  res.json(pay);
};

// POST /api/payments
exports.create = (req, res) => {
  const { rental_id, type, amount, method, provider_ref, status, paid_at, handled_by } = req.body || {};
  if (!rental_id || !type || !amount || !method)
    return res.status(400).json({ error: "rental_id, type, amount, method là bắt buộc" });

  const allowedTypes = ["Rental Fee", "Deposit", "Deposit Refund", "Fine"];
  if (!allowedTypes.includes(type))
    return res.status(400).json({ error: `type phải thuộc: ${allowedTypes.join(", ")}` });

  const allowedStatus = ["Pending", "Success", "Failed", "Refunded"];
  if (status && !allowedStatus.includes(status))
    return res.status(400).json({ error: `status phải thuộc: ${allowedStatus.join(", ")}` });

  const payment_id = generateId("px");
  const created = {
    payment_id, rental_id, type, amount, method,
    provider_ref: provider_ref || null,
    status: status || "Pending",
    paid_at: paid_at || new Date().toISOString(),
    handled_by: handled_by || null
  };
  payments.push(created);
  res.status(201).json(created);
};

// PATCH /api/payments/:id
exports.update = (req, res) => {
  const idx = payments.findIndex(p => p.payment_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Payment not found" });
  payments[idx] = { ...payments[idx], ...req.body };
  res.json(payments[idx]);
};

// PATCH /api/payments/:id/status
exports.updateStatus = (req, res) => {
  const idx = payments.findIndex(p => p.payment_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Payment not found" });

  const { status } = req.body || {};
  const valid = ["Pending", "Success", "Failed", "Refunded"];
  if (!status || !valid.includes(status))
    return res.status(400).json({ error: `status phải thuộc: ${valid.join(", ")}` });

  payments[idx].status = status;
  res.json(payments[idx]);
};

// DELETE /api/payments/:id
exports.remove = (req, res) => {
  const idx = payments.findIndex(p => p.payment_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Payment not found" });
  payments.splice(idx, 1);
  res.status(204).end();
};
