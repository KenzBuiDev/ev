// src/routes/billing.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/billing.controller");
const auth = require("../middleware/auth");

// Cho user đăng nhập (renter/staff/admin) xin báo giá
router.post("/quote", auth, ctrl.quote);

module.exports = router;
