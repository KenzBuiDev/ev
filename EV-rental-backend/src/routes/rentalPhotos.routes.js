const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/rentalPhotos.controller");
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

// GET: mở
router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);

// Staff/Admin CRUD
router.post("/", auth, requireRole("admin", "staff"), ctrl.create);
router.patch("/:id", auth, requireRole("admin", "staff"), ctrl.update);
router.delete("/:id", auth, requireRole("admin", "staff"), ctrl.remove);

module.exports = router;
