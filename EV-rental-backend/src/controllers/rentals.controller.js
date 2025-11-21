/**
 * RENTALS CONTROLLER
 * 
 * Xử lý các request liên quan đến rental (đơn thuê xe)
 * 
 * Các function chính:
 * - getMine: Lấy rentals của user (filter by renter_id)
 * - getAll: Lấy tất cả rentals
 * - getById: Lấy 1 rental theo ID
 * - create: Tạo rental mới (được gọi sau khi thanh toán thành công)
 * - update: Cập nhật rental
 * - remove: Xóa rental
 */

const Rental = require("../models/Rental");
const Vehicle = require("../models/Vehicle");
const { nextId } = require("../utils/idHelper");

/**
 * GET /rentals/me
 * 
 * Lấy danh sách rentals của user hiện tại
 * - Tự động filter theo renter_id từ JWT token
 * - Được gọi bởi Profile page khi user xem lịch sử thuê
 * 
 * Response: [
 *   {
 *     rental_id: "rt001",
 *     vehicle_id: "v001",
 *     renter_id: "user123",
 *     start_time: "2024-11-21T10:30:00Z",
 *     end_time: "2024-11-21T14:30:00Z",
 *     estimated_amount: 400000,
 *     status: "active",
 *     ...
 *   }
 * ]
 */
exports.getMine = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const docs = await Rental.find({ renter_id: userId }).lean();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    // Lấy danh sách tất cả rental và populate user information
    // Tìm user data dựa vào renter_id để hiển thị tên người dùng
    const docs = await Rental.find().lean();

    // Nếu có rentals, populate user info cho mỗi rental
    if (docs && docs.length > 0) {
      const User = require("../models/User");
      const enrichedDocs = await Promise.all(
        docs.map(async (rental) => {
          if (rental.renter_id) {
            try {
              const user = await User.findOne({ user_id: rental.renter_id }).lean();
              if (user) {
                rental.renter_name = user.full_name || user.email;
                rental.renter_phone = user.phone;
              }
            } catch (e) {
              // Nếu không tìm được user, cứ tiếp tục với renter_id
              console.error(`Error finding user ${rental.renter_id}:`, e);
            }
          }
          return rental;
        })
      );
      return res.json(enrichedDocs);
    }

    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const doc = await Rental.findOne({
      rental_id: req.params.id,
    }).lean();
    if (!doc) return res.status(404).json({ message: "Rental not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    // Auto-set renter_id from authenticated user
    const userId = req.user?.user_id;
    if (userId) {
      data.renter_id = userId;
    }
    data.rental_id =
      data.rental_id || (await nextId(Rental, "rt", "rental_id"));
    const doc = await Rental.create(data);

    // Update vehicle status to "Rented" when rental is created
    // This marks the vehicle as unavailable for other users
    if (data.vehicle_id) {
      await Vehicle.findOneAndUpdate(
        { vehicle_id: data.vehicle_id },
        { status: "Rented" },
        { new: true }
      );
    }

    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    // Get current rental first to know the vehicle_id
    const currentRental = await Rental.findOne({ rental_id: req.params.id }).lean();
    if (!currentRental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    // Update rental
    const doc = await Rental.findOneAndUpdate(
      { rental_id: req.params.id },
      req.body,
      { new: true }
    );

    // Update vehicle status based on new rental status
    const newStatus = req.body.status;
    if (newStatus) {
      let vehicleStatus = "Available";

      if (newStatus === "active" || newStatus === "Ongoing") {
        vehicleStatus = "Rented";
      } else if (newStatus === "Completed" || newStatus === "completed") {
        vehicleStatus = "Available";
      } else if (newStatus === "Cancelled" || newStatus === "cancelled") {
        vehicleStatus = "Available";
      } else if (newStatus === "Maintenance" || newStatus === "maintenance") {
        vehicleStatus = "Maintenance";
      }

      await Vehicle.findOneAndUpdate(
        { vehicle_id: currentRental.vehicle_id },
        { status: vehicleStatus },
        { new: true }
      );
    }

    if (!doc) return res.status(404).json({ message: "Rental not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const userRole = req.user?.role;

    // Tìm rental
    const rental = await Rental.findOne({ rental_id: req.params.id });
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    // Kiểm tra quyền: User chỉ có thể xóa rental của mình, admin có thể xóa bất kỳ
    if (userRole !== "admin" && rental.renter_id !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own rentals" });
    }

    // Xóa rental
    await Rental.findOneAndDelete({ rental_id: req.params.id });
    res.json({ success: true, message: "Rental deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
