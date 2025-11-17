// src/routes/reservations.routes.js
const express = require("express");
const router = express.Router();
const reservations = require("../controllers/reservations.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

// tạo reservation: chỉ renter + staff
router.post(
  "/",
  requireAuth,
  requireRole("renter", "staff", "admin"),
  reservations.create
);

// lấy 1 reservation (checkout, VNPay)
router.get("/:id", requireAuth, reservations.getById);

module.exports = router;
