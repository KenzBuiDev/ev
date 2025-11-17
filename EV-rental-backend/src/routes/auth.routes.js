// src/routes/auth.routes.js
const express = require("express");
const router = express.Router();

// Controller & middleware
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");

// Đăng nhập
router.post("/login", authController.login);

// Đăng ký (nếu bạn muốn dùng, còn không thì có thể xoá route này)
router.post("/register", authController.register);

// Lấy thông tin user hiện tại (cần token Bearer)
router.get("/me", authMiddleware, authController.me);

module.exports = router;
