// src/controllers/main.controller.js
const pkg = require("../../package.json");

// Import tất cả các model cần thiết để tổng hợp dữ liệu
const users = require("../models/users.model");
const stations = require("../models/stations.model");
const vehicles = require("../models/vehicles.model");
const vehicleImages = require("../models/vehicleImages.model");
const batteryLogs = require("../models/batteryLogs.model");
const renterProfiles = require("../models/renterProfiles.model");
const staffProfiles = require("../models/staffProfiles.model");
const reservations = require("../models/reservations.model");
const rentals = require("../models/rentals.model");
const rentalPhotos = require("../models/rentalPhotos.model");
const handovers = require("../models/handovers.model");
const userDocs = require("../models/userDocs.model");
const verifications = require("../models/verifications.model");
const payments = require("../models/payments.model");
const damageReports = require("../models/damageReports.model");


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

// ✅ Tổng hợp dữ liệu tổng quan (dashboard summary)
exports.summary = (req, res) => {
  const summary = {
    users: users.length,
    stations: stations.length,
    vehicles: vehicles.length,
    vehicleImages: vehicleImages.length,
    batteryLogs: batteryLogs.length,
    renterProfiles: renterProfiles.length,
    staffProfiles: staffProfiles.length,
    reservations: reservations.length,
    rentals: rentals.length,
    rentalPhotos: rentalPhotos.length,
    handovers: handovers.length,
    userDocs: userDocs.length,
    verifications: verifications.length,
    payments: payments.length,
    damageReports: damageReports.length,
  };

  res.json({ success: true, summary });
};

// ✅ Thống kê nhanh theo trạng thái hoạt động
exports.stats = (req, res) => {
  const stats = {
    activeUsers: users.filter(u => u.is_active).length,
    availableVehicles: vehicles.filter(v => v.status === "Available").length,
    rentedVehicles: vehicles.filter(v => v.status === "Rented").length,
    maintenanceVehicles: vehicles.filter(v => v.status === "Maintenance").length,
    pendingReservations: reservations.filter(r => r.status === "Pending").length,
    confirmedReservations: reservations.filter(r => r.status === "Confirmed").length,
    ongoingRentals: rentals.filter(r => r.status === "Ongoing").length,
    completedRentals: rentals.filter(r => r.status === "Completed").length,
    verifiedDocs: userDocs.filter(d => d.status === "Verified").length,
    pendingVerifications: verifications.filter(v => v.result === "Pending").length,
    totalPayments: payments.length,
    successfulPayments: payments.filter(p => p.status === "Success").length,
    pendingDamageReports: damageReports.filter(r => r.status !== "Resolved").length,
  };

  res.json({ success: true, stats });
};
