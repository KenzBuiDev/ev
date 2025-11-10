const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/rentals.controller");
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");
const renterProfiles = require("../models/renterProfiles.model");

// Lấy danh sách rentals
router.get("/", auth, (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "staff") return next();

  const my = renterProfiles.find((r) => r.user_id === req.user.user_id);
  if (!my) {
    return res
      .status(403)
      .json({ success: false, error: { code: 403, message: "No renter profile" } });
  }

  req.query.renter_id = my.renter_id;
  next();
}, ctrl.list);

// Lấy rental theo ID
router.get("/:id", auth, ctrl.getById);

// Tạo rental: admin/staff
router.post("/", auth, requireRole("admin", "staff"), ctrl.create);

// Tạo rental: renter tự tạo
router.post("/renter", auth, ctrl.createForRenter);

// Cập nhật rental
router.patch("/:id", auth, requireRole("admin", "staff"), ctrl.update);

// Cập nhật status
router.patch("/:id/status", auth, requireRole("admin", "staff"), ctrl.updateStatus);

// Xóa rental
router.delete("/:id", auth, requireRole("admin"), ctrl.remove);

module.exports = router;
