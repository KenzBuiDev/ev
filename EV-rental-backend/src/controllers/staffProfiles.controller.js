const StaffProfile = require("../models/StaffProfile");
const { nextId } = require("../utils/idHelper");

exports.getAll = async (req, res) => {
  try {
    const docs = await StaffProfile.find().lean();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const doc = await StaffProfile.findOne({
      staff_id: req.params.id,
    }).lean();
    if (!doc) return res.status(404).json({ message: "Staff profile not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    data.staff_id =
      data.staff_id || (await nextId(StaffProfile, "s", "staff_id"));
    const doc = await StaffProfile.create(data);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await StaffProfile.findOneAndUpdate(
      { staff_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Staff profile not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await StaffProfile.findOneAndDelete({
      staff_id: req.params.id,
    });
    if (!doc) return res.status(404).json({ message: "Staff profile not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
