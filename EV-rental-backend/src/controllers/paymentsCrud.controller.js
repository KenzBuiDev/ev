const Payment = require("../models/Payment");
const { nextId } = require("../utils/idHelper");

exports.getAll = async (req, res) => {
  try {
    const docs = await Payment.find().lean();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const doc = await Payment.findOne({
      payment_id: req.params.id,
    }).lean();
    if (!doc) return res.status(404).json({ message: "Payment not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    data.payment_id =
      data.payment_id || (await nextId(Payment, "px", "payment_id"));
    const doc = await Payment.create(data);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await Payment.findOneAndUpdate(
      { payment_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Payment not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Payment.findOneAndDelete({
      payment_id: req.params.id,
    });
    if (!doc) return res.status(404).json({ message: "Payment not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
