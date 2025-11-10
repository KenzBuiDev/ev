const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/verifications.controller");
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

// List/Detail: admin (có thể mở cho staff nếu muốn)
router.get("/", auth, requireRole("admin"), ctrl.list);
router.get("/:id", auth, requireRole("admin"), ctrl.getById);

// Create/Update/Delete: admin
router.post("/", auth, requireRole("admin"), ctrl.create);
router.patch("/:id", auth, requireRole("admin"), ctrl.update);
router.delete("/:id", auth, requireRole("admin"), ctrl.remove);

module.exports = router;
