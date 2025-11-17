const DamageReport = require("../models/DamageReport");
const { nextId } = require("../utils/idHelper");

exports.getAll = async (req, res) => {
  try {
    const docs = await DamageReport.find().lean();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const doc = await DamageReport.findOne({
      report_id: req.params.id,
    }).lean();
    if (!doc) return res.status(404).json({ message: "Damage report not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    data.report_id =
      data.report_id || (await nextId(DamageReport, "drx", "report_id"));
    const doc = await DamageReport.create(data);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await DamageReport.findOneAndUpdate(
      { report_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Damage report not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await DamageReport.findOneAndDelete({
      report_id: req.params.id,
    });
    if (!doc) return res.status(404).json({ message: "Damage report not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
