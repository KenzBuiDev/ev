/**
 * RENTALS ROUTES
 * 
 * Các endpoints quản lý đơn thuê xe (Rental)
 * 
 * WORKFLOW:
 * 1. User thanh toán thành công → Frontend gọi POST /rentals
 * 2. Backend tạo rental record với auto-set renter_id từ JWT
 * 3. User xem lịch sử → Frontend gọi GET /rentals/me
 * 4. Backend trả về rentals của user (filtered by renter_id)
 */

const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/rentals.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

/**
 * GET /rentals
 * Lấy tất cả rentals (admin/staff/renter có thể xem)
 */
router.get("/", requireAuth, requireRole("admin", "staff", "renter"), ctrl.getAll);

/**
 * GET /rentals/me
 * Lấy danh sách rentals của user hiện tại
 * - Backend tự động filter theo renter_id từ JWT token
 * - Được gọi bởi Profile page
 */
router.get("/me", requireAuth, ctrl.getMine);

/**
 * GET /rentals/:id
 * Lấy chi tiết 1 rental
 */
router.get("/:id", requireAuth, ctrl.getById);

/**
 * POST /rentals
 * Tạo rental mới sau khi user thanh toán thành công
 * 
 * Request body:
 * {
 *   vehicle_id: "v001",
 *   start_time: "2024-11-21T10:30:00.000Z",
 *   end_time: "2024-11-21T14:30:00.000Z",
 *   estimated_amount: 400000,
 *   reservation_id: "rsv001",
 *   status: "active"
 * }
 * 
 * Note: Renter user CÓ THỂ tạo rental (đã fix permission)
 * Backend sẽ tự động set renter_id từ JWT token của user
 */
router.post("/", requireAuth, ctrl.create);

/**
 * PUT /rentals/:id
 * Cập nhật rental (chỉ admin/staff)
 */
router.put("/:id", requireAuth, requireRole("admin", "staff"), ctrl.update);

/**
 * PATCH /rentals/:id
 * Cập nhật partial rental (chỉ admin/staff)
 */
router.patch("/:id", requireAuth, requireRole("admin", "staff"), ctrl.update);

/**
 * DELETE /rentals/:id
 * Xóa rental (user có thể xóa rental của mình, admin có thể xóa bất kỳ)
 */
router.delete("/:id", requireAuth, ctrl.remove);

module.exports = router;
