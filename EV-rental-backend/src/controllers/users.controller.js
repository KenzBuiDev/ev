// src/controllers/users.controller.js
const User = require("../models/User");

// GET /api/users
exports.getAll = async (req, res) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id (user_id)
exports.getById = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.params.id }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users
exports.create = async (req, res) => {
  try {
    const data = req.body;
    const count = await User.countDocuments();
    data.user_id = data.user_id || `u${(count + 1).toString().padStart(3, "0")}`;
    const user = await User.create(data);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/users/:id
exports.update = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { user_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/users/:id
exports.remove = async (req, res) => {
  try {
    const result = await User.findOneAndDelete({ user_id: req.params.id });
    if (!result) return res.status(404).json({ message: "User not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
