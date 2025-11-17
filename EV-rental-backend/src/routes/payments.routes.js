const express = require("express");
const router = express.Router();
const {
  createVNPayLink,
  vnpReturn,
  vnpIpn,
} = require("../controllers/payments.controller");
const { requireAuth } = require("../middleware/auth");

// Tạo link thanh toán – user phải login
router.post("/vnpay/create", requireAuth, createVNPayLink);

// Return URL (nếu VNP_RETURN_URL trỏ về backend)
router.get("/vnpay/return", vnpReturn);

// IPN callback
router.get("/vnpay/ipn", vnpIpn);

module.exports = router;
