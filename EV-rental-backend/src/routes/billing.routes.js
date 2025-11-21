// =============================================================================================
// BILLING ROUTES
// =============================================================================================

/**
 * Routes liên quan đến billing (tính giá, báo giá, etc)
 * 
 * Public endpoint: Người dùng có thể tính giá trước khi book
 * No authentication required vì dùng để hiển thị giá cho khách
 */

const express = require("express");
const router = express.Router();
const billingController = require("../controllers/billing.controller");

// =============================================================================================
// POST /api/billing/quote
// =============================================================================================

/**
 * Tính báo giá cho một lần thuê xe
 * 
 * Request body:
 * {
 *   "vehicle_id": "v001",
 *   "start_time": "2024-12-20T08:00:00Z",
 *   "end_time": "2024-12-20T10:00:00Z"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "vehicle_id": "v001",
 *     "hours": 2,
 *     "price_per_hour": 50000,
 *     "billing_unit": "giờ",
 *     "currency": "VNĐ",
 *     "amount": 100000
 *   }
 * }
 * 
 * Lỗi có thể xảy ra:
 * - 400: Thiếu vehicle_id, start_time, hoặc end_time
 * - 400: vehicle_id không tồn tại
 * - 400: Định dạng thời gian không hợp lệ
 * 
 * Quá trình tính giá:
 * 1. Lấy vehicle từ DB theo vehicle_id
 * 2. Parse start_time và end_time thành Date objects
 * 3. Tính số giờ = (end_time - start_time) / 3600000 ms
 * 4. Nếu hours <= 0, thêm 24 giờ (coi như qua ngày)
 * 5. Làm tròn hours lên 1 chữ số thập phân
 * 6. Amount = hours * price_per_hour (làm tròn thành số nguyên VNĐ)
 */
router.post("/quote", billingController.quote);

module.exports = router;
