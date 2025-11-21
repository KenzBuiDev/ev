// =============================================================================================
// RESERVATIONS ROUTES
// =============================================================================================

/**
 * Routes liên quan đến booking/reservation (giữ xe)
 * 
 * Workflow:
 * 1. User chọn xe, thời gian → Frontend POST /api/billing/quote (tính giá)
 * 2. User confirm → Frontend POST /api/reservations (tạo reservation)
 * 3. User thanh toán VNPay → Backend POST /api/payments/vnpay/create (tạo payment link)
 * 4. User quay lại từ VNPay → Frontend GET /api/reservations/:id (verify reservation)
 * 5. Frontend POST /api/rentals (tạo rental từ reservation)
 * 
 * Authentication: All endpoints require JWT token (requireAuth)
 * Authorization: POST requires renter/staff/admin role
 */

const express = require("express");
const router = express.Router();
const reservations = require("../controllers/reservations.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

// =============================================================================================
// POST /api/reservations
// =============================================================================================

/**
 * Tạo một reservation (giữ xe)
 * 
 * Request:
 *   Authorization: "Bearer <JWT_TOKEN>"
 *   Body:
 *   {
 *     "vehicle_id": "v001",
 *     "start_time": "2024-12-20T08:00:00Z",
 *     "end_time": "2024-12-20T10:00:00Z"
 *   }
 * 
 * Response (201):
 *   {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "reservation_id": "rsv001",
 *     "renter_id": "r001",
 *     "vehicle_id": "v001",
 *     "start_time": "2024-12-20T08:00:00Z",
 *     "end_time": "2024-12-20T10:00:00Z",
 *     "status": "Confirmed",
 *     "hold_deposit": "500000 VND",
 *     "estimated_amount": 100000,
 *     "currency": "VND",
 *     "created_by_staff": null,
 *     "created_at": "2024-12-19T15:30:00Z"
 *   }
 * 
 * Quá trình tạo reservation:
 * 1. Validate input: vehicle_id, start_time, end_time required
 * 2. Fetch vehicle từ MongoDB để verify xe tồn tại + lấy price_per_hour
 * 3. Tính báo giá (hours + amount) dùng calcQuote() helper
 * 4. Generate reservation_id dạng "rsv001", "rsv002", etc
 * 5. Extract renter_id từ JWT token (req.user.renter_id hoặc req.user.user_id)
 * 6. Create Reservation document với status = "Confirmed"
 * 7. Trả về newly created reservation object
 * 
 * Error cases:
 * - 401: Không có valid JWT token
 * - 403: User role không phải renter/staff/admin
 * - 404: vehicle_id không tồn tại trong DB
 * - 400: Invalid input hoặc database error
 */
router.post(
  "/",
  requireAuth,
  requireRole("renter", "staff", "admin"),
  reservations.create
);

// =============================================================================================
// GET /api/reservations/:id
// =============================================================================================

/**
 * Lấy thông tin 1 reservation
 * 
 * Parameters:
 *   id: reservation_id (e.g., "rsv001")
 * 
 * Response (200):
 *   {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "reservation_id": "rsv001",
 *     "renter_id": "r001",
 *     "vehicle_id": "v001",
 *     "start_time": "2024-12-20T08:00:00Z",
 *     "end_time": "2024-12-20T10:00:00Z",
 *     "status": "Confirmed",
 *     "hold_deposit": "500000 VND",
 *     "estimated_amount": 100000,
 *     "currency": "VND",
 *     "created_by_staff": null,
 *     "created_at": "2024-12-19T15:30:00Z"
 *   }
 * 
 * Quá trình:
 * 1. Verify JWT token (requireAuth)
 * 2. Query Reservation collection theo reservation_id
 * 3. Trả về reservation object hoặc 404 nếu không tìm thấy
 * 
 * Dùng trong:
 * - Checkout page: Hiển thị chi tiết reservation trước khi thanh toán
 * - PaymentReturn: Verify reservation + lấy thông tin để tạo rental
 * - Fallback API: Nếu sessionStorage bị mất, frontend có thể call API này
 * 
 * Error cases:
 * - 401: Không có valid JWT token
 * - 404: reservation_id không tìm thấy
 * - 500: Server error
 */
router.get("/:id", requireAuth, reservations.getById);

module.exports = router;
