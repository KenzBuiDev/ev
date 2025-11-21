// =============================================================================================
// BILLING CONTROLLER
// =============================================================================================

/**
 * Xử lý các logic liên quan đến tính giá thuê xe
 * - Tính báo giá (quote) dựa trên xe + thời gian thuê
 * - Được gọi trước khi user tạo reservation
 */

const { ok, err } = require("../utils/response");
const { quoteByTimeRange } = require("../utils/billing");

// =============================================================================================
// POST /api/billing/quote
// =============================================================================================

/**
 * Tính báo giá cho khoảng thời gian thuê
 * 
 * Input:
 *   - vehicle_id (required): ID của xe
 *   - start_time (required): Thời gian bắt đầu thuê (ISO 8601 format)
 *   - end_time (required): Thời gian kết thúc thuê (ISO 8601 format)
 * 
 * Process:
 *   1. Validate input: kiểm tra 3 required params
 *   2. Gọi quoteByTimeRange() từ utils/billing.js
 *      - Lấy vehicle object từ MongoDB
 *      - Tính số giờ giữa start_time và end_time
 *      - Nhân với price_per_hour từ vehicle
 *      - Trả về chi tiết giá (hours, rate, amount)
 *   3. Trả về quote object cho client
 * 
 * Response format:
 *   {
 *     "success": true,
 *     "data": {
 *       "vehicle_id": "v001",
 *       "hours": 2.5,
 *       "price_per_hour": 50000,
 *       "billing_unit": "giờ",
 *       "currency": "VNĐ",
 *       "amount": 125000
 *     }
 *   }
 * 
 * Errors:
 *   - 400: Nếu thiếu required params
 *   - 400: Nếu vehicle không tồn tại
 *   - 400: Nếu thời gian định dạng sai
 */
exports.quote = async (req, res) => {
    try {
        // Step 1: Extract + validate request body
        const { vehicle_id, start_time, end_time } = req.body || {};
        if (!vehicle_id || !start_time || !end_time)
            return err(res, 400, "vehicle_id, start_time, end_time are required");

        // Step 2: Call billing utility để tính giá
        // This will:
        // - Fetch vehicle from DB
        // - Calculate hours between start_time and end_time
        // - Apply price_per_hour rate
        // - Return quote object
        const q = await quoteByTimeRange({ vehicle_id, start_time, end_time });

        // Step 3: Return quote response
        ok(res, q);
    } catch (e) {
        console.error(e);
        err(res, 400, e.message || "Cannot quote");
    }
};