const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/userDocs.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", requireAuth, requireRole("admin", "staff"), ctrl.getAll);
router.get("/:id", requireAuth, ctrl.getById);
router.post("/", requireAuth, ctrl.create); // renter/staff upload doc
router.put("/:id", requireAuth, requireRole("admin", "staff"), ctrl.update);
router.delete("/:id", requireAuth, requireRole("admin"), ctrl.remove);

module.exports = router;
