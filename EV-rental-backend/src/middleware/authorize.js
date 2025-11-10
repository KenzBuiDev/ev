// src/middleware/authorize.js
const staffProfiles = require("../models/staffProfiles.model");
const renterProfiles = require("../models/renterProfiles.model");
const reservations = require("../models/reservations.model");
const rentals = require("../models/rentals.model");
const vehicles = require("../models/vehicles.model");

// 1) Yêu cầu 1 trong các role
exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ success: false, error: { code: 401, message: "Unauthorized" } });
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, error: { code: 403, message: "Forbidden" } });
  next();
};

// 2) Self hoặc role
exports.requireSelfOrRole = (getTargetUserId, ...roles) => (req, res, next) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, error: { code: 401, message: "Unauthorized" } });
    const targetUserId = getTargetUserId(req);
    if (req.user.user_id === targetUserId) return next();
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ success: false, error: { code: 403, message: "Forbidden" } });
  } catch (e) {
    return res.status(400).json({ success: false, error: { code: 400, message: "Bad self/role check" } });
  }
};

// 3) Staff chỉ thao tác trong station của mình (admin bỏ qua)
exports.requireStaffStationScope = (getTargetStationId) => (req, res, next) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, error: { code: 401, message: "Unauthorized" } });
    if (req.user.role === "admin") return next();
    if (req.user.role !== "staff")
      return res.status(403).json({ success: false, error: { code: 403, message: "Staff/Admin only" } });

    const me = staffProfiles.find((s) => s.user_id === req.user.user_id);
    if (!me)
      return res.status(403).json({ success: false, error: { code: 403, message: "No staff profile found" } });

    const targetStationId = getTargetStationId(req);
    if (me.station_id !== targetStationId) {
      return res.status(403).json({ success: false, error: { code: 403, message: "Out of station scope" } });
    }
    next();
  } catch (e) {
    return res.status(400).json({ success: false, error: { code: 400, message: "Bad station scope check" } });
  }
};

// 4) Renter chỉ được truy cập reservation của chính mình
exports.requireOwnReservation = () => (req, res, next) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, error: { code: 401, message: "Unauthorized" } });
    if (req.user.role === "admin" || req.user.role === "staff") return next();
    const { id } = req.params;
    const rsv = reservations.find((r) => r.reservation_id === id);
    if (!rsv) return res.status(404).json({ success: false, error: { code: 404, message: "Reservation not found" } });

    const my = renterProfiles.find((r) => r.user_id === req.user.user_id);
    if (!my || my.renter_id !== rsv.renter_id)
      return res.status(403).json({ success: false, error: { code: 403, message: "Not your reservation" } });

    next();
  } catch (e) {
    return res.status(400).json({ success: false, error: { code: 400, message: "Bad reservation ownership check" } });
  }
};

// 5) Renter chỉ được truy cập rental của chính mình
exports.requireOwnRental = () => (req, res, next) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, error: { code: 401, message: "Unauthorized" } });
    if (req.user.role === "admin" || req.user.role === "staff") return next();
    const { id } = req.params;
    const rental = rentals.find((r) => r.rental_id === id);
    if (!rental) return res.status(404).json({ success: false, error: { code: 404, message: "Rental not found" } });

    const my = renterProfiles.find((r) => r.user_id === req.user.user_id);
    if (!my || my.renter_id !== rental.renter_id)
      return res.status(403).json({ success: false, error: { code: 403, message: "Not your rental" } });

    next();
  } catch (e) {
    return res.status(400).json({ success: false, error: { code: 400, message: "Bad rental ownership check" } });
  }
};

// 6) Staff chỉ được cập nhật/đổi trạng thái vehicle thuộc station của mình
exports.requireVehicleInMyStation = () => (req, res, next) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, error: { code: 401, message: "Unauthorized" } });
    if (req.user.role === "admin") return next();
    if (req.user.role !== "staff")
      return res.status(403).json({ success: false, error: { code: 403, message: "Staff/Admin only" } });

    const me = staffProfiles.find((s) => s.user_id === req.user.user_id);
    if (!me)
      return res.status(403).json({ success: false, error: { code: 403, message: "No staff profile" } });

    const { id } = req.params;
    const v = vehicles.find((vh) => vh.vehicle_id === id);
    if (!v) return res.status(404).json({ success: false, error: { code: 404, message: "Vehicle not found" } });
    if (v.station_id !== me.station_id) {
      return res
        .status(403)
        .json({ success: false, error: { code: 403, message: "Vehicle is not in your station" } });
    }
    next();
  } catch (e) {
    return res.status(400).json({ success: false, error: { code: 400, message: "Bad vehicle scope check" } });
  }
};
