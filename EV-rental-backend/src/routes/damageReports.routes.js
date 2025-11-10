const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/damageReports.controller");
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

// List/Detail: ai đăng nhập cũng xem được
router.get("/", auth, ctrl.list);
router.get("/:id", auth, ctrl.getById);

// Create: admin hoặc renter (staff không được)
router.post("/", auth, (req, res, next) => {
  if (req.user.role === "staff") {
    return res
      .status(403)
      .json({ success: false, error: { code: 403, message: "Staff cannot create damage reports" } });
  }
  next();
}, ctrl.create);

// Update/Resolve/Delete: chỉ admin
router.patch("/:id", auth, requireRole("admin"), ctrl.update);
router.patch("/:id/resolve", auth, requireRole("admin"), ctrl.resolve);
router.delete("/:id", auth, requireRole("admin"), ctrl.remove);

module.exports = router;
