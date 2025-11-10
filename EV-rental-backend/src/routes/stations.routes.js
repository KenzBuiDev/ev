const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/stations.controller");
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

// GET mở (hoặc bật auth nếu muốn)
router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);

// Admin CRUD
router.post("/", auth, requireRole("admin"), ctrl.create);
router.patch("/:id", auth, requireRole("admin"), ctrl.update);
router.delete("/:id", auth, requireRole("admin"), ctrl.remove);

module.exports = router;
