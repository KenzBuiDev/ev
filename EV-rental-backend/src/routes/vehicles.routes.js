// src/routes/vehicles.routes.js
const express = require("express");
const router = express.Router();
const vehicles = require("../controllers/vehicles.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

// public xem danh sách xe
router.get("/", vehicles.getAll);
router.get("/:id", vehicles.getById);

// staff/admin quản lý
router.post("/", requireAuth, requireRole("admin", "staff"), vehicles.create);
router.put("/:id", requireAuth, requireRole("admin", "staff"), vehicles.update);

module.exports = router;
