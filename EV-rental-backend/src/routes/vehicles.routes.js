const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/vehicles.controller");
const auth = require("../middleware/auth");
const { requireRole, requireStaffStationScope, requireVehicleInMyStation } = require("../middleware/authorize");

// GET mở
router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);

// Create: admin hoặc staff (staff: chỉ được tạo trong station của mình)
router.post(
  "/",
  auth,
  (req, res, next) =>
    req.user.role === "admin"
      ? next()
      : requireStaffStationScope((req2) => req2.body.station_id)(req, res, next),
  ctrl.create
);

// Update/Delete: admin hoặc staff trong station của mình
router.patch("/:id", auth, requireVehicleInMyStation(), ctrl.update);
router.delete("/:id", auth, requireVehicleInMyStation(), ctrl.remove);

module.exports = router;
