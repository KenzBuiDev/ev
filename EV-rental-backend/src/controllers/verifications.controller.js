const Verification = require("../models/Verification");
const { nextId } = require("../utils/idHelper");

exports.getAll = async (req, res) => {
  try {
    const docs = await Verification.find().lean();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const doc = await Verification.findOne({
      verification_id: req.params.id,
    }).lean();
    if (!doc) return res.status(404).json({ message: "Verification not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    data.verification_id =
      data.verification_id ||
      (await nextId(Verification, "vfx", "verification_id"));
    const doc = await Verification.create(data);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await Verification.findOneAndUpdate(
      { verification_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Verification not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Verification.findOneAndDelete({
      verification_id: req.params.id,
    });
    if (!doc) return res.status(404).json({ message: "Verification not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
