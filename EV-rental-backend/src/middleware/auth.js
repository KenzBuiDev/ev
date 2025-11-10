// src/middleware/auth.js
const { verifyAccess } = require("../utils/jwt");
const users = require("../models/users.model");

// Middleware xác thực JWT. Sau khi xác thực,
// gắn req.user = { user_id, role, email, full_name }
module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: { code: 401, message: "Missing token" } });
    }

    const decoded = verifyAccess(token); // { user_id, role, ... }
    const user = users.find((u) => u.user_id === decoded.user_id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: { code: 401, message: "Invalid user" } });
    }

    req.user = {
      user_id: user.user_id,
      role: user.role,
      email: user.email,
      full_name: user.full_name,
    };
    next();
  } catch (e) {
    return res
      .status(401)
      .json({ success: false, error: { code: 401, message: "Invalid or expired token" } });
  }
};
