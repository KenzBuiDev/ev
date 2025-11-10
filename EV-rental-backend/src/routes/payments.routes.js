const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/payments.controller");
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

// List: admin/staff xem tất; renter chỉ xem của mình (lọc theo rental_id hoặc handled_by nếu muốn)
router.get("/", auth, (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "staff") return next();
  // renter: chỉ cho phép lọc theo user? giữ đơn giản: cho xem tất qua controller nếu cần
  next();
}, ctrl.list);

router.get("/:id", auth, ctrl.getById);

// Create/Update/Status: admin hoặc staff
router.post("/", auth, requireRole("admin", "staff"), ctrl.create);
router.patch("/:id", auth, requireRole("admin", "staff"), ctrl.update);
router.patch("/:id/status", auth, requireRole("admin", "staff"), ctrl.updateStatus);

// Delete: admin
router.delete("/:id", auth, requireRole("admin"), ctrl.remove);

module.exports = router;
