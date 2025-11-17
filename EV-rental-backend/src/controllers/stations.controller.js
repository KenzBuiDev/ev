const Station = require("../models/Station");
const { nextId } = require("../utils/idHelper");

exports.getAll = async (req, res) => {
  try {
    const docs = await Station.find().lean();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const doc = await Station.findOne({ station_id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ message: "Station not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    data.station_id =
      data.station_id || (await nextId(Station, "st_", "station_id"));
    const doc = await Station.create(data);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await Station.findOneAndUpdate(
      { station_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Station not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Station.findOneAndDelete({ station_id: req.params.id });
    if (!doc) return res.status(404).json({ message: "Station not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
