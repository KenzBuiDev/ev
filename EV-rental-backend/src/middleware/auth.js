// src/middleware/auth.js
const { verifyAccess } = require("../utils/jwt");
const User = require("../models/User");
const { requireRole } = require("./authorize");

// Middleware xác thực JWT.
// Sau khi xác thực → req.user = { user_id, role, email, full_name }
const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: "Missing token" },
      });
    }

    const decoded = verifyAccess(token); // { user_id, role, ... }

    // 🔥 Lấy user từ Mongo thay cho seed
    const user = await User.findOne({ user_id: decoded.user_id }).lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: "Invalid user" },
      });
    }

    req.user = {
      user_id: user.user_id,
      role: user.role,
      email: user.email,
      full_name: user.full_name,
    };

    next();
  } catch (e) {
    console.error("[auth middleware]", e);
    return res.status(401).json({
      success: false,
      error: { code: 401, message: "Invalid or expired token" },
    });
  }
};

// Giữ tương thích với cả import default và destructuring
module.exports = requireAuth;
module.exports.requireAuth = requireAuth;
module.exports.requireRole = requireRole;
