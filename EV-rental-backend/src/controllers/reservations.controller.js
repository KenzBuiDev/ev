// =============================================================================================
// RESERVATIONS CONTROLLER
// =============================================================================================

/**
 * Xử lý logic tạo + lấy reservations (giữ chỗ xe)
 * 
 * Reservation là giữ chỗ tạm thời trước khi thanh toán
 * - Khi tạo: status = "Confirmed" (nhưng chưa thanh toán)
 * - Khi user đã thanh toán VNPay: Frontend tạo Rental từ Reservation
 * 
 * Relationships:
 * - Reservation.renter_id → User.user_id
 * - Reservation.vehicle_id → Vehicle.vehicle_id
 */

const Reservation = require("../models/Reservation");
const Vehicle = require("../models/Vehicle");

// =============================================================================================
// HELPER: calcQuote()
// =============================================================================================

/**
 * Tính báo giá (số giờ + tổng tiền) cho một lần giữ xe
 * 
 * Parameters:
 *   - vehicle: Vehicle document từ DB (cần có property price_per_hour)
 *   - start_time: ISO datetime string (e.g., "2024-12-20T08:00:00Z")
 *   - end_time: ISO datetime string (e.g., "2024-12-20T10:00:00Z")
 * 
 * Returns:
 *   {
 *     hours: 2,        // Số giờ (làm tròn lên)
 *     amount: 100000,  // Tổng tiền = hours * price_per_hour
 *     price_per_hour: 50000
 *   }
 * 
 * Quá trình:
 * 1. Parse start_time, end_time thành Date objects
 * 2. Nếu end <= start: Cộng 24 giờ (coi như qua ngày hôm sau)
 *    Example: start = 20:00, end = 8:00 → cộng 24h → end = 08:00 hôm sau
 * 3. Tính millisecond difference: end - start
 * 4. Convert ms thành hours: ms / 3600000 (3600000ms = 1 giờ)
 * 5. Làm tròn lên (Math.ceil): 1.5 → 2, 2 → 2
 * 6. Tính amount = hours * price_per_hour
 * 
 * Why Math.ceil? Vì khách thuê 1.5 giờ thì phải trả 2 giờ (không trả theo phút)
 */
function calcQuote(vehicle, start_time, end_time) {
  const start = new Date(start_time);
  let end = new Date(end_time);
  // Nếu end <= start (ví dụ khách book từ 20:00 đến 08:00 hôm sau)
  // thì cộng 24 giờ
  if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  const ms = end - start;
  const hours = Math.ceil(ms / 3600000);
  const price = Number(vehicle.price_per_hour || 0);
  const amount = hours * price;
  return { hours, amount, price_per_hour: price };
}

// =============================================================================================
// GET /api/reservations/:id
// =============================================================================================

/**
 * Lấy thông tin 1 reservation theo ID
 * 
 * Input: req.params.id = reservation_id (e.g., "rsv001")
 * 
 * Process:
 * 1. Query Reservation collection: { reservation_id: req.params.id }
 * 2. Use .lean() để trả về plain JS object (không phải Mongoose document)
 * 3. Nếu không tìm thấy: trả 404
 * 4. Nếu tìm thấy: trả 200 + reservation object
 * 
 * Output: Reservation document với tất cả fields
 * {
 *   "_id": "507f1f77bcf86cd799439011",
 *   "reservation_id": "rsv001",
 *   "renter_id": "r001",
 *   "vehicle_id": "v001",
 *   "start_time": "2024-12-20T08:00:00Z",
 *   "end_time": "2024-12-20T10:00:00Z",
 *   "status": "Confirmed",
 *   "hold_deposit": "500000 VND",
 *   "estimated_amount": 100000,
 *   "currency": "VND",
 *   "created_by_staff": null,
 *   "created_at": "2024-12-19T15:30:00Z",
 *   "updated_at": "2024-12-19T15:30:00Z"
 * }
 * 
 * Dùng bởi:
 * - Checkout.jsx: Fetch reservation khi sessionStorage bị mất
 * - PaymentReturn.jsx: Verify reservation sau VNPay callback
 * 
 * Error responses:
 * - 404: Reservation không tìm thấy
 * - 500: Database error
 */
exports.getById = async (req, res) => {
  try {
    const r = await Reservation.findOne({
      reservation_id: req.params.id,
    }).lean();
    if (!r) return res.status(404).json({ message: "Reservation not found" });
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =============================================================================================
// POST /api/reservations
// =============================================================================================

/**
 * Tạo một reservation mới
 * 
 * Input: req.body
 * {
 *   "vehicle_id": "v001",
 *   "start_time": "2024-12-20T08:00:00Z",
 *   "end_time": "2024-12-20T10:00:00Z"
 * }
 * 
 * Process:
 * 1. Extract vehicle_id, start_time, end_time từ request body
 * 2. Fetch vehicle từ DB: kiểm tra xe tồn tại + lấy price_per_hour
 *    → 404 nếu không tìm thấy
 * 3. Tính báo giá: gọi calcQuote() → lấy hours + amount
 * 4. Generate reservation_id:
 *    - Count tất cả reservations trong DB
 *    - Format: "rsv" + (count+1) padded to 3 digits
 *    - Example: "rsv001", "rsv002", "rsv099", "rsv100"
 * 5. Extract renter_id từ JWT token:
 *    - req.user?.renter_id (nếu map renter_id trong JWT)
 *    - hoặc req.user?.user_id (fallback)
 *    - hoặc "r001" (default, không nên dùng)
 * 6. Create Reservation document:
 *    - status: "Confirmed" (ngay từ lúc tạo)
 *    - hold_deposit: "500000 VND" (tiền đặt cọc tạm thời)
 *    - estimated_amount: đã tính từ step 3
 *    - created_by_staff: nếu user là staff thì ghi user_id, nếu renter thì null
 * 7. Trả 201 + reservation object cho client
 * 
 * Output: Newly created Reservation document
 * {
 *   "_id": "507f1f77bcf86cd799439011",
 *   "reservation_id": "rsv001",
 *   "renter_id": "r001",
 *   "vehicle_id": "v001",
 *   "start_time": "2024-12-20T08:00:00Z",
 *   "end_time": "2024-12-20T10:00:00Z",
 *   "status": "Confirmed",
 *   "hold_deposit": "500000 VND",
 *   "estimated_amount": 100000,
 *   "currency": "VND",
 *   "created_by_staff": null,
 *   "created_at": "2024-12-19T15:30:00Z"
 * }
 * 
 * Workflow context:
 * - VehicleDetail.jsx: User chọn xe + thời gian → gọi API này
 * - Response lưu vào sessionStorage("last_reservation")
 * - Frontend navigate sang Checkout page
 * - Checkout redirect sang VNPay
 * - Sau thanh toán, Frontend dùng reservation này để tạo Rental
 * 
 * Error responses:
 * - 400: Thiếu required params hoặc database error
 * - 404: vehicle_id không tìm thấy
 */
exports.create = async (req, res) => {
  try {
    // Step 1: Extract input
    const { vehicle_id, start_time, end_time } = req.body;

    // Step 2: Fetch vehicle - verify it exists & get price
    const vehicle = await Vehicle.findOne({ vehicle_id }).lean();
    if (!vehicle)
      return res.status(404).json({ message: "Vehicle not found" });

    // Step 3: Calculate quote (hours + amount)
    const { hours, amount } = calcQuote(vehicle, start_time, end_time);

    // Step 4: Generate reservation_id
    const count = await Reservation.countDocuments();
    const reservation_id = `rsv${(count + 1)
      .toString()
      .padStart(3, "0")}`;

    // Step 5: Extract renter_id from JWT token
    const renter_id =
      req.user?.renter_id || req.user?.user_id || "r001"; // fallback to r001 (not ideal)

    // Step 6: Create Reservation document
    const doc = await Reservation.create({
      reservation_id,
      renter_id,
      vehicle_id,
      start_time,
      end_time,
      status: "Confirmed", // Đánh dấu là confirmed ngay (nhưng chưa thanh toán)
      hold_deposit: "500000 VND", // Tiền đặt cọc
      created_by_staff: req.user?.role === "staff" ? req.user.user_id : null, // Ghi nhân ai tạo
      estimated_amount: amount, // Giá đã tính
      currency: "VND",
    });

    // Step 7: Return 201 Created with new reservation
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
