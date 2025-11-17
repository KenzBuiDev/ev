const VehicleImage = require("../models/VehicleImage");
const { nextId } = require("../utils/idHelper");

exports.getAll = async (req, res) => {
  try {
    const docs = await VehicleImage.find().lean();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const doc = await VehicleImage.findOne({
      image_id: req.params.id,
    }).lean();
    if (!doc) return res.status(404).json({ message: "Vehicle image not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    data.image_id =
      data.image_id || (await nextId(VehicleImage, "i", "image_id"));
    const doc = await VehicleImage.create(data);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await VehicleImage.findOneAndUpdate(
      { image_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Vehicle image not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await VehicleImage.findOneAndDelete({
      image_id: req.params.id,
    });
    if (!doc) return res.status(404).json({ message: "Vehicle image not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
