// src/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Mongoose model User

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// Tạo access token từ user
function signAccess(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

// Đăng ký (tuỳ, nếu bạn có dùng)
exports.register = async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email và password là bắt buộc" });
    }

    const exists = await User.findOne({ email }).lean();
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Email đã được đăng ký" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // user_id có thể là u00x, bạn tuỳ cách generate
    const userCount = await User.countDocuments();
    const user_id = `u${String(userCount + 1).padStart(3, "0")}`;

    const user = await User.create({
      user_id,
      full_name: full_name || email,
      email,
      role: role || "renter",
      passwordHash,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.json({
      success: true,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
    });
  } catch (err) {
    console.error("[auth.register] error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal error", error: err.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email và password là bắt buộc" });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Sai email hoặc mật khẩu" });
    }

    // Hỗ trợ cả 2 kiểu:
    // - user.passwordHash (mã hoá)
    // - user.password (plain text cũ trong sample)
    let ok = false;
    if (user.passwordHash) {
      ok = await bcrypt.compare(password, user.passwordHash);
    } else if (user.password) {
      ok = password === user.password;
    }

    if (!ok) {
      return res
        .status(401)
        .json({ success: false, message: "Sai email hoặc mật khẩu" });
    }

    const token = signAccess(user);

    return res.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
    });
  } catch (err) {
    console.error("[auth.login] error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal error", error: err.message });
  }
};

// Lấy info user hiện tại (dùng sau middleware auth.js đã verify token)
exports.me = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ user_id: req.user.user_id }).lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        is_active: user.is_active,
      },
    });
  } catch (err) {
    console.error("[auth.me] error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal error", error: err.message });
  }
};
