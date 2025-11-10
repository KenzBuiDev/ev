const stations = require("../models/stations.model");

exports.list = (req, res) => {
  const { q } = req.query;
  let data = stations;
  if (q) data = data.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
  res.json(data);
};

exports.getById = (req, res) => {
  const item = stations.find(s => s.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Station not found' });
  res.json(item);
};

exports.create = (req, res) => {
  const { name, address, lat, lng, isOpen = true } = req.body || {};
  if (!name || !address || lat == null || lng == null)
    return res.status(400).json({ error: 'name, address, lat, lng are required' });

  const id = `st_${Date.now()}`;
  const created = { id, name, address, lat, lng, isOpen };
  stations.push(created);
  res.status(201).json(created);
};

exports.update = (req, res) => {
  const idx = stations.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Station not found' });
  stations[idx] = { ...stations[idx], ...req.body, id: stations[idx].id };
  res.json(stations[idx]);
};

exports.remove = (req, res) => {
  const idx = stations.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Station not found' });
  stations.splice(idx, 1);
  res.status(204).end();
};
