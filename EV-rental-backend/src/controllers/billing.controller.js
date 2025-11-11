// src/controllers/billing.controller.js
const { ok, err } = require("../utils/response");
const { quoteByTimeRange } = require("../utils/billing");

exports.quote = (req, res) => {
  try {
    const { vehicle_id, start_time, end_time } = req.body || {};
    if (!vehicle_id || !start_time || !end_time)
      return err(res, 400, "vehicle_id, start_time, end_time are required");
    const q = quoteByTimeRange({ vehicle_id, start_time, end_time });
    ok(res, q);
  } catch (e) {
    console.error(e);
    err(res, 400, e.message || "Cannot quote");
  }
};
