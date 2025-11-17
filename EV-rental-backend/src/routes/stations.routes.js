const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/stations.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

router.post("/", requireAuth, requireRole("admin", "staff"), ctrl.create);
router.put("/:id", requireAuth, requireRole("admin", "staff"), ctrl.update);
router.delete("/:id", requireAuth, requireRole("admin"), ctrl.remove);

module.exports = router;
