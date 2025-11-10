const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/users.controller");
const auth = require("../middleware/auth");
const { requireRole, requireSelfOrRole } = require("../middleware/authorize");

// Admin: list
router.get("/", auth, requireRole("admin"), ctrl.list);

// Self hoặc Admin (Staff chỉ self)
router.get("/:id", auth, requireSelfOrRole((req) => req.params.id, "admin"), ctrl.getById);

// Create: admin
router.post("/", auth, requireRole("admin"), ctrl.create);

// Update: self hoặc admin
router.patch("/:id", auth, requireSelfOrRole((req) => req.params.id, "admin"), ctrl.update);

// Delete: admin
router.delete("/:id", auth, requireRole("admin"), ctrl.remove);

module.exports = router;
