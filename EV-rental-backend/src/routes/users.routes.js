// src/routes/users.routes.js
const express = require("express");
const router = express.Router();

const users = require("../controllers/users.controller");

// Middleware
const requireAuth = require("../middleware/auth");
const { requireRole, requireSelfOrRole } = require("../middleware/authorize");

// ==========================
//   USER ROUTES + ROLE RULES
// ==========================
//
// Admin:
//   - GET all users
//   - CREATE user
//   - DELETE user
//
// Staff:
//   - GET/UPDATE only chính mình
//
// Renter:
//   - GET/UPDATE only chính mình
//

// ADMIN: lấy toàn bộ user
router.get("/", requireAuth, requireRole("admin"), users.getAll);

// ADMIN + SELF: lấy user theo id
router.get(
  "/:id",
  requireAuth,
  requireSelfOrRole((req) => req.params.id, "admin"),
  users.getById
);

// ADMIN: tạo user
router.post("/", requireAuth, requireRole("admin"), users.create);

// ADMIN + SELF: cập nhật user
router.put(
  "/:id",
  requireAuth,
  requireSelfOrRole((req) => req.params.id, "admin"),
  users.update
);

// ADMIN: xóa user
router.delete("/:id", requireAuth, requireRole("admin"), users.remove);

module.exports = router;
