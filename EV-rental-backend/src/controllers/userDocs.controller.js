const UserDoc = require("../models/UserDoc");
const { nextId } = require("../utils/idHelper");

exports.getAll = async (req, res) => {
  try {
    const docs = await UserDoc.find().lean();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const doc = await UserDoc.findOne({ doc_id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ message: "User doc not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    data.doc_id = data.doc_id || (await nextId(UserDoc, "d", "doc_id"));
    const doc = await UserDoc.create(data);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await UserDoc.findOneAndUpdate(
      { doc_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "User doc not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await UserDoc.findOneAndDelete({ doc_id: req.params.id });
    if (!doc) return res.status(404).json({ message: "User doc not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
