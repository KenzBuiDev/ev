// src/middleware/authorize.js
const StaffProfile = require("../models/StaffProfile");
const RenterProfile = require("../models/RenterProfile");
const Reservation = require("../models/Reservation");
const Rental = require("../models/Rental");
const Vehicle = require("../models/Vehicle");

// 1) Yêu cầu user có 1 role nằm trong danh sách
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: { code: 401, message: "Unauthorized" } });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, error: { code: 403, message: "Forbidden" } });
    }

    next();
  };
}

// 2) Self hoặc role
function requireSelfOrRole(getTargetUserId, ...roles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, error: { code: 401, message: "Unauthorized" } });
      }

      const targetUserId = getTargetUserId(req);

      // chính mình
      if (req.user.user_id === targetUserId) return next();

      // hoặc có role đặc biệt
      if (roles.includes(req.user.role)) return next();

      return res
        .status(403)
        .json({ success: false, error: { code: 403, message: "Forbidden" } });
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "Bad self/role check" },
      });
    }
  };
}

// 3) Staff chỉ thao tác vehicle/station của mình
function requireStaffStationScope(getTargetStationId) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, error: { code: 401, message: "Unauthorized" } });
      }

      if (req.user.role === "admin") return next();
      if (req.user.role !== "staff") {
        return res
          .status(403)
          .json({ success: false, error: { code: 403, message: "Staff only" } });
      }

      const me = await StaffProfile.findOne({ user_id: req.user.user_id }).lean();
      if (!me) {
        return res.status(403).json({
          success: false,
          error: { code: 403, message: "Staff profile not found" },
        });
      }

      const targetStationId = getTargetStationId(req);
      if (me.station_id !== targetStationId) {
        return res.status(403).json({
          success: false,
          error: { code: 403, message: "Out of station scope" },
        });
      }

      next();
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "Station scope check failed" },
      });
    }
  };
}

// 4) Renter chỉ được xem reservation của chính mình
function requireOwnReservation() {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, error: { code: 401, message: "Unauthorized" } });
      }

      if (req.user.role === "admin" || req.user.role === "staff") return next();

      const { id } = req.params;
      const rsv = await Reservation.findOne({ reservation_id: id }).lean();
      if (!rsv) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: "Reservation not found" },
        });
      }

      const my = await RenterProfile.findOne({ user_id: req.user.user_id }).lean();

      if (!my || my.renter_id !== rsv.renter_id) {
        return res.status(403).json({
          success: false,
          error: { code: 403, message: "Not your reservation" },
        });
      }

      next();
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "Reservation owner check failed" },
      });
    }
  };
}

// 5) Renter chỉ được truy cập rental của chính mình
function requireOwnRental() {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, error: { code: 401, message: "Unauthorized" } });
      }

      if (req.user.role === "admin" || req.user.role === "staff") return next();

      const { id } = req.params;
      const rental = await Rental.findOne({ rental_id: id }).lean();
      if (!rental) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: "Rental not found" },
        });
      }

      const my = await RenterProfile.findOne({ user_id: req.user.user_id }).lean();

      if (!my || my.renter_id !== rental.renter_id) {
        return res.status(403).json({
          success: false,
          error: { code: 403, message: "Not your rental" },
        });
      }

      next();
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "Rental owner check failed" },
      });
    }
  };
}

// 6) Staff chỉ được sửa vehicle trong station của mình
function requireVehicleInMyStation() {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, error: { code: 401, message: "Unauthorized" } });
      }

      if (req.user.role === "admin") return next();
      if (req.user.role !== "staff") {
        return res
          .status(403)
          .json({ success: false, error: { code: 403, message: "Staff only" } });
      }

      const me = await StaffProfile.findOne({ user_id: req.user.user_id }).lean();
      if (!me) {
        return res.status(403).json({
          success: false,
          error: { code: 403, message: "Staff profile not found" },
        });
      }

      const { id } = req.params;
      const vehicle = await Vehicle.findOne({ vehicle_id: id }).lean();
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: "Vehicle not found" },
        });
      }

      if (vehicle.station_id !== me.station_id) {
        return res.status(403).json({
          success: false,
          error: { code: 403, message: "Vehicle not in your station" },
        });
      }

      next();
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "Vehicle station check failed" },
      });
    }
  };
}

module.exports = {
  requireRole,
  requireSelfOrRole,
  requireStaffStationScope,
  requireOwnReservation,
  requireOwnRental,
  requireVehicleInMyStation,
};
