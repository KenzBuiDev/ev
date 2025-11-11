// src/routes/payments.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/payments.controller");
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

/**
 * VNPay flow:
 * - POST /vnpay/create  → tạo URL/QR thanh toán cho reservation hoặc rental
 * - GET  /vnpay/return  → user được redirect về sau khi thanh toán
 * - GET  /vnpay/ipn     → VNPay gọi server-to-server xác nhận giao dịch
 */

// renter/staff/admin đều có thể tạo link thanh toán
router.post(
  "/vnpay/create",
  auth,
  requireRole("admin", "staff", "renter"),
  ctrl.createVnpayPayment
);

// Callback/notify
router.get("/vnpay/return", ctrl.vnpayReturn);
router.get("/vnpay/ipn", ctrl.vnpayIpn);

/**
 * (Tùy chọn) Nếu bạn còn dùng CRUD payments thủ công, giữ các route bên dưới.
 * Nếu không cần, có thể bỏ hẳn để gọn API.
 */

// Danh sách payments (admin/staff xem tất; renter tuỳ chính sách ở controller)
router.get("/", auth, (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "staff") return next();
  // renter: để controller quyết định lọc theo rental/reservation của chính mình nếu muốn
  next();
}, ctrl.list ?? ((req, res) => res.status(404).json({ success:false, error:{code:404, message:"Not implemented"}})));

// Chi tiết 1 payment
router.get("/:id", auth, ctrl.getById ?? ((req, res) => res.status(404).json({ success:false, error:{code:404, message:"Not implemented"}})));

// Tạo/Cập nhật/Xoá thủ công (nếu cần)
router.post("/", auth, requireRole("admin", "staff"), ctrl.create ?? ((req, res) => res.status(404).json({ success:false, error:{code:404, message:"Not implemented"}})));
router.patch("/:id", auth, requireRole("admin", "staff"), ctrl.update ?? ((req, res) => res.status(404).json({ success:false, error:{code:404, message:"Not implemented"}})));
router.patch("/:id/status", auth, requireRole("admin", "staff"), ctrl.updateStatus ?? ((req, res) => res.status(404).json({ success:false, error:{code:404, message:"Not implemented"}})));
router.delete("/:id", auth, requireRole("admin"), ctrl.remove ?? ((req, res) => res.status(404).json({ success:false, error:{code:404, message:"Not implemented"}})));

module.exports = router;
