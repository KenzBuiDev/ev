const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reservations.controller");
const auth = require("../middleware/auth");
const { requireRole, requireOwnReservation } = require("../middleware/authorize");

const renterProfiles = require("../models/renterProfiles.model");
const staffProfiles = require("../models/staffProfiles.model");
const vehicles = require("../models/vehicles.model");
const reservations = require("../models/reservations.model");

/**
 * Middleware: áp quyền xem danh sách
 * - admin: xem tất
 * - renter: chỉ xem reservation của chính mình (ép query.renter_id)
 * - staff: chỉ xem reservation của các vehicle thuộc station của staff (ép query._stationScoped = true)
 */
function applyListScope(req, res, next) {
  const role = req.user.role;
  if (role === "admin") return next();

  if (role === "renter") {
    const me = renterProfiles.find(r => r.user_id === req.user.user_id);
    if (!me) return res.status(403).json({ success:false, error:{code:403, message:"No renter profile"}});
    req.query.renter_id = me.renter_id;  // ép chỉ xem của mình
    return next();
  }

  if (role === "staff") {
    const me = staffProfiles.find(s => s.user_id === req.user.user_id);
    if (!me) return res.status(403).json({ success:false, error:{code:403, message:"No staff profile"}});
    // Gắn station_id vào req để controller filter theo station
    req.query._stationScoped = me.station_id;
    return next();
  }

  return res.status(403).json({ success:false, error:{code:403, message:"Forbidden"}});
}

/**
 * Middleware: kiểm tra quyền xem chi tiết 1 reservation
 * - admin: pass
 * - renter: phải sở hữu (renter_id khớp với profile của mình)
 * - staff: vehicle của reservation phải thuộc station của staff
 */
function canViewReservation(req, res, next) {
  const role = req.user.role;
  if (role === "admin") return next();

  const id = req.params.id;
  const rsv = reservations.find(r => r.reservation_id === id);
  if (!rsv) return res.status(404).json({ success:false, error:{code:404, message:"Reservation not found"}});

  if (role === "renter") {
    const me = renterProfiles.find(r => r.user_id === req.user.user_id);
    if (!me) return res.status(403).json({ success:false, error:{code:403, message:"No renter profile"}});
    if (me.renter_id !== rsv.renter_id) {
      return res.status(403).json({ success:false, error:{code:403, message:"Not your reservation"}});
    }
    return next();
  }

  if (role === "staff") {
    const me = staffProfiles.find(s => s.user_id === req.user.user_id);
    if (!me) return res.status(403).json({ success:false, error:{code:403, message:"No staff profile"}});
    const v = vehicles.find(x => x.vehicle_id === rsv.vehicle_id);
    if (!v) return res.status(404).json({ success:false, error:{code:404, message:"Vehicle not found"}});
    if (v.station_id !== me.station_id) {
      return res.status(403).json({ success:false, error:{code:403, message:"Out of station scope"}});
    }
    return next();
  }

  return res.status(403).json({ success:false, error:{code:403, message:"Forbidden"}});
}

// ====== GET (MỞ CHO admin, staff, renter) ======
router.get("/", auth, requireRole("admin", "staff", "renter"), applyListScope, ctrl.list);
router.get("/:id", auth, requireRole("admin", "staff", "renter"), canViewReservation, ctrl.getById);

// ====== POST/PATCH/DELETE (Staff vẫn bị chặn) ======
router.post(
  "/",
  auth,
  requireRole("admin", "renter"),
  // renter: ép renter_id = self (giữ đúng ownership)
  (req, res, next) => {
    if (req.user.role === "renter") {
      const me = renterProfiles.find(r => r.user_id === req.user.user_id);
      if (!me) return res.status(403).json({ success:false, error:{code:403, message:"No renter profile"}});
      req.body.renter_id = me.renter_id;
    }
    next();
  },
  ctrl.create
);

// renter owner hoặc admin có thể update (sử dụng middleware có sẵn cho renter owner)
router.patch("/:id", auth, requireRole("admin", "renter"), requireOwnReservation(), ctrl.update);
router.patch("/:id/status", auth, requireRole("admin", "renter"), requireOwnReservation(), ctrl.updateStatus);

// delete: admin
router.delete("/:id", auth, requireRole("admin"), ctrl.remove);

module.exports = router;
