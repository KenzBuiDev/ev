const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/rentals.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", requireAuth, requireRole("admin", "staff"), ctrl.getAll);
router.get("/:id", requireAuth, ctrl.getById);
router.post("/", requireAuth, requireRole("admin", "staff"), ctrl.create);
router.put("/:id", requireAuth, requireRole("admin", "staff"), ctrl.update);
router.delete("/:id", requireAuth, requireRole("admin"), ctrl.remove);

module.exports = router;
