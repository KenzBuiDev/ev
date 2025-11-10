const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/renterProfiles.controller");
const auth = require("../middleware/auth");
const { requireRole, requireSelfOrRole } = require("../middleware/authorize");
const renterProfiles = require("../models/renterProfiles.model");

// List: admin xem tất; staff/renter chỉ self
const enforceSelfInList = (req, res, next) => {
  if (req.user.role === "admin") return next();
  const my = renterProfiles.find((r) => r.user_id === req.user.user_id);
  req.query.renter_id = my ? my.renter_id : "__NONE__";
  next();
};

router.get("/", auth, enforceSelfInList, ctrl.list);

// Detail: self hoặc admin (staff chỉ self)
router.get(
  "/:id",
  auth,
  requireSelfOrRole(
    (req) => {
      const target = renterProfiles.find((r) => r.renter_id === req.params.id);
      return target?.user_id;
    },
    "admin"
  ),
  ctrl.getById
);

// Create: admin
router.post("/", auth, requireRole("admin"), ctrl.create);

// Update: renter self hoặc admin (chặn staff)
const blockStaffUpdate = (req, res, next) => {
  if (req.user.role === "staff") {
    return res
      .status(403)
      .json({ success: false, error: { code: 403, message: "Staff cannot update renter profiles" } });
  }
  next();
};

router.patch(
  "/:id",
  auth,
  blockStaffUpdate,
  requireSelfOrRole(
    (req) => {
      const target = renterProfiles.find((r) => r.renter_id === req.params.id);
      return target?.user_id;
    },
    "admin"
  ),
  ctrl.update
);

// Delete: admin
router.delete("/:id", auth, requireRole("admin"), ctrl.remove);

module.exports = router;
