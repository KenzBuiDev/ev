// src/controllers/users.controller.js
const users = require("../models/users.model");
const { generateId } = require("../utils/generateId");

exports.list = (req, res) => {
  const { role } = req.query;
  const data = role ? users.filter(u => u.role === role) : users;
  res.json(data);
};

exports.getById = (req, res) => {
  const user = users.find(u => u.user_id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

exports.create = (req, res) => {
  const { full_name, email, phone, role, password } = req.body || {};
  if (!full_name || !email || !password)
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

  const user_id = generateId("u");
  const newUser = {
    user_id,
    full_name,
    email,
    phone,
    role: role || "renter",
    password,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  };
  users.push(newUser);
  res.status(201).json(newUser);
};

exports.update = (req, res) => {
  const idx = users.findIndex(u => u.user_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });

  users[idx] = { ...users[idx], ...req.body, updated_at: new Date().toISOString() };
  res.json(users[idx]);
};

exports.remove = (req, res) => {
  const idx = users.findIndex(u => u.user_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  users.splice(idx, 1);
  res.status(204).end();
};
