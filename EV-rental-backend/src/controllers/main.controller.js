// src/controllers/main.controller.js
const pkg = require("../../package.json");

// Import Mongoose models
const User = require("../models/User");
const Station = require("../models/Station");
const Vehicle = require("../models/Vehicle");
const VehicleImage = require("../models/VehicleImage");
const BatteryLog = require("../models/BatteryLog");
const RenterProfile = require("../models/RenterProfile");
const StaffProfile = require("../models/StaffProfile");
const Reservation = require("../models/Reservation");
const Rental = require("../models/Rental");
const RentalPhoto = require("../models/RentalPhoto");
const Handover = require("../models/Handover");
const UserDoc = require("../models/UserDoc");
const Verification = require("../models/Verification");
const Payment = require("../models/Payment");
const DamageReport = require("../models/DamageReport");

// ✅ Trang chào mừng
exports.root = (req, res) => {
  res.json({
    app: "EV Rental API",
    version: pkg.version,
    message: "Welcome 🚗⚡ EV Rental backend is running successfully!",
    docs: "/api/routes",
  });
};

// ✅ Kiểm tra tình trạng hệ thống
exports.health = (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

// ✅ Thông tin ứng dụng
exports.info = (req, res) => {
  res.json({
    name: pkg.name,
    version: pkg.version,
    node: process.version,
    env: process.env.NODE_ENV || "development",
  });
};

// ✅ Liệt kê các route API chính
exports.routes = (req, res) => {
  res.json({
    api_prefixes: [
      "/api/users",
      "/api/renter-profiles",
      "/api/staff-profiles",
      "/api/stations",
      "/api/vehicles",
      "/api/vehicle-images",
      "/api/battery-logs",
      "/api/reservations",
      "/api/rentals",
      "/api/rental-photos",
      "/api/handovers",
      "/api/user-docs",
      "/api/verifications",
      "/api/payments",
      "/api/damage-reports",
    ],
  });
};

// ✅ Tổng hợp dữ liệu tổng quan (dashboard summary) – lấy từ Mongo
exports.summary = async (req, res) => {
  try {
    const [
      usersCount,
      stationsCount,
      vehiclesCount,
      vehicleImagesCount,
      batteryLogsCount,
      renterProfilesCount,
      staffProfilesCount,
      reservationsCount,
      rentalsCount,
      rentalPhotosCount,
      handoversCount,
      userDocsCount,
      verificationsCount,
      paymentsCount,
      damageReportsCount,
    ] = await Promise.all([
      User.countDocuments(),
      Station.countDocuments(),
      Vehicle.countDocuments(),
      VehicleImage.countDocuments(),
      BatteryLog.countDocuments(),
      RenterProfile.countDocuments(),
      StaffProfile.countDocuments(),
      Reservation.countDocuments(),
      Rental.countDocuments(),
      RentalPhoto.countDocuments(),
      Handover.countDocuments(),
      UserDoc.countDocuments(),
      Verification.countDocuments(),
      Payment.countDocuments(),
      DamageReport.countDocuments(),
    ]);

    const summary = {
      users: usersCount,
      stations: stationsCount,
      vehicles: vehiclesCount,
      vehicleImages: vehicleImagesCount,
      batteryLogs: batteryLogsCount,
      renterProfiles: renterProfilesCount,
      staffProfiles: staffProfilesCount,
      reservations: reservationsCount,
      rentals: rentalsCount,
      rentalPhotos: rentalPhotosCount,
      handovers: handoversCount,
      userDocs: userDocsCount,
      verifications: verificationsCount,
      payments: paymentsCount,
      damageReports: damageReportsCount,
    };

    res.json({ success: true, summary });
  } catch (err) {
    console.error("[main.summary] error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Thống kê nhanh theo trạng thái hoạt động – lấy từ Mongo
exports.stats = async (req, res) => {
  try {
    const [
      activeUsers,
      availableVehicles,
      rentedVehicles,
      maintenanceVehicles,
      pendingReservations,
      confirmedReservations,
      ongoingRentals,
      completedRentals,
      verifiedDocs,
      pendingVerifications,
      totalPayments,
      successfulPayments,
      pendingDamageReports,
    ] = await Promise.all([
      User.countDocuments({ is_active: true }),
      Vehicle.countDocuments({ status: "Available" }),
      Vehicle.countDocuments({ status: "Rented" }),
      Vehicle.countDocuments({ status: "Maintenance" }),

      Reservation.countDocuments({ status: "Pending" }),
      Reservation.countDocuments({ status: "Confirmed" }),

      Rental.countDocuments({ status: "Ongoing" }),
      Rental.countDocuments({ status: "Completed" }),

      UserDoc.countDocuments({ status: "Verified" }),
      // Trong data mẫu của bạn result = "Approved"/"Rejected",
      // nếu sau này có "Pending" thì sẽ đếm được ở đây
      Verification.countDocuments({ result: "Pending" }),

      Payment.countDocuments(),
      Payment.countDocuments({ status: "Success" }),

      DamageReport.countDocuments({ status: { $ne: "Resolved" } }),
    ]);

    const stats = {
      activeUsers,
      availableVehicles,
      rentedVehicles,
      maintenanceVehicles,
      pendingReservations,
      confirmedReservations,
      ongoingRentals,
      completedRentals,
      verifiedDocs,
      pendingVerifications,
      totalPayments,
      successfulPayments,
      pendingDamageReports,
    };

    res.json({ success: true, stats });
  } catch (err) {
    console.error("[main.stats] error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
