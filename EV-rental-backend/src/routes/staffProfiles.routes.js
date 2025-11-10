const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/staffProfiles.controller");
const auth = require("../middleware/auth");
const { requireRole, requireSelfOrRole } = require("../middleware/authorize");

// List: admin xem tất; staff chỉ self
router.get("/", auth, (req, res, next) => {
  if (req.user.role === "admin") return next();
  // ép user_id = self
  req.query.user_id = req.user.user_id;
  next();
}, ctrl.list);

// Detail: self hoặc admin
router.get("/:id", auth, requireSelfOrRole(
  (req) => {
    const staffProfiles = require("../models/staffProfiles.model");
    const item = staffProfiles.find(s => s.staff_id === req.params.id);
    return item?.user_id;
  }, "admin"
), ctrl.getById);

// Create/Update/Delete: admin
router.post("/", auth, requireRole("admin"), ctrl.create);
router.patch("/:id", auth, requireRole("admin"), ctrl.update);
router.delete("/:id", auth, requireRole("admin"), ctrl.remove);

module.exports = router;
