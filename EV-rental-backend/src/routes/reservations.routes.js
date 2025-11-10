const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reservations.controller");
const auth = require("../middleware/auth");
const { requireOwnReservation } = require("../middleware/authorize");
const renterProfiles = require("../models/renterProfiles.model");

const blockStaff = (req, res, next) => {
  if (req.user.role === "staff") {
    return res
      .status(403)
      .json({ success: false, error: { code: 403, message: "Staff cannot access reservations" } });
  }
  next();
};

router.get(
  "/",
  auth,
  blockStaff,
  (req, res, next) => {
    if (req.user.role === "admin") return next();
    const my = renterProfiles.find((r) => r.user_id === req.user.user_id);
    if (!my)
      return res
        .status(403)
        .json({ success: false, error: { code: 403, message: "No renter profile" } });
    req.query.renter_id = my.renter_id;
    next();
  },
  ctrl.list
);

router.get("/:id", auth, blockStaff, requireOwnReservation(), ctrl.getById);

router.post(
  "/",
  auth,
  blockStaff,
  (req, res, next) => {
    if (req.user.role === "admin") return next();
    const my = renterProfiles.find((r) => r.user_id === req.user.user_id);
    if (!my)
      return res
        .status(403)
        .json({ success: false, error: { code: 403, message: "No renter profile" } });
    req.body.renter_id = my.renter_id;
    next();
  },
  ctrl.create
);

router.patch("/:id", auth, blockStaff, requireOwnReservation(), ctrl.update);
router.patch("/:id/status", auth, blockStaff, requireOwnReservation(), ctrl.updateStatus);
router.delete("/:id", auth, blockStaff, requireOwnReservation(), ctrl.remove);

module.exports = router;
