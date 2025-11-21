/**
 * PAYMENTS ROUTES
 * 
 * Các endpoints xử lý thanh toán qua VNPay
 * 
 * WORKFLOW:
 * 1. Frontend gọi POST /payments/vnpay/create kèm reservation_id
 * 2. Backend tính tiền từ reservation + vehicle info
 * 3. Tạo link thanh toán VNPay → trả về payment_url
 * 4. Frontend redirect user sang VNPay gateway
 * 5. User thanh toán (hoặc cancel)
 * 6. VNPay redirect về frontend + callback đến IPN endpoint
 */

const express = require("express");
const router = express.Router();
const {
  createVNPayLink,
  vnpReturn,
  vnpIpn,
} = require("../controllers/payments.controller");
const { requireAuth } = require("../middleware/auth");

/**
 * POST /payments/vnpay/create
 * 
 * Tạo link thanh toán VNPay
 * - User phải login (requireAuth)
 * - Được gọi từ Checkout page
 * 
 * Request body:
 * {
 *   reservation_id: "rsv001"
 * }
 * 
 * Response:
 * {
 *   payment_url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
 *   order_id: "20241121123456",
 *   created_at: "2024-11-21T..."
 * }
 */
router.post("/vnpay/create", requireAuth, createVNPayLink);

/**
 * GET /payments/vnpay/return
 * 
 * Return URL - VNPay redirect về đây sau khi user thanh toán
 * - Verify signature từ VNPay
 * - Redirect về frontend với all VNPay params
 * 
 * Frontend sẽ parse params để hiển thị kết quả
 */
router.get("/vnpay/return", vnpReturn);

/**
 * GET /payments/vnpay/ipn
 * 
 * IPN (Instant Payment Notification)
 * - Server-to-server callback từ VNPay
 * - Xác nhận giao dịch thành công
 * - Có thể update reservation/payment status
 * 
 * Note: Luôn trả HTTP 200 cho VNPay (theo spec)
 */
router.get("/vnpay/ipn", vnpIpn);

module.exports = router;
