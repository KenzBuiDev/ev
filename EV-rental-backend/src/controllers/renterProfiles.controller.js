const RenterProfile = require("../models/RenterProfile");
const { nextId } = require("../utils/idHelper");

exports.getAll = async (req, res) => {
  try {
    const docs = await RenterProfile.find().lean();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const doc = await RenterProfile.findOne({
      renter_id: req.params.id,
    }).lean();
    if (!doc) return res.status(404).json({ message: "Renter profile not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    data.renter_id =
      data.renter_id || (await nextId(RenterProfile, "r", "renter_id"));
    const doc = await RenterProfile.create(data);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await RenterProfile.findOneAndUpdate(
      { renter_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Renter profile not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await RenterProfile.findOneAndDelete({
      renter_id: req.params.id,
    });
    if (!doc) return res.status(404).json({ message: "Renter profile not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
