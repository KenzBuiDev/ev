const Handover = require("../models/Handover");
const { nextId } = require("../utils/idHelper");

exports.getAll = async (req, res) => {
  try {
    const docs = await Handover.find().lean();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const doc = await Handover.findOne({
      handover_id: req.params.id,
    }).lean();
    if (!doc) return res.status(404).json({ message: "Handover not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    data.handover_id =
      data.handover_id || (await nextId(Handover, "hdx", "handover_id"));
    const doc = await Handover.create(data);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await Handover.findOneAndUpdate(
      { handover_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Handover not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Handover.findOneAndDelete({
      handover_id: req.params.id,
    });
    if (!doc) return res.status(404).json({ message: "Handover not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
