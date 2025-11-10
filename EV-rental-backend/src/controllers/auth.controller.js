// src/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const users = require("../models/users.model");
const { signAccess, signRefresh, verifyRefresh } = require("../utils/jwt");
const { ok, created, err } = require("../utils/response");

// simple in-memory blacklist cho refresh token (tuỳ chọn)
const revokedRefreshTokens = new Set();

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return err(res, 400, "email, password are required");

    const user = users.find(u => u.email === email);
    if (!user) return err(res, 401, "Invalid email or password");

    const hashed = user.password && user.password.startsWith("$2");
    const passOk = hashed ? await bcrypt.compare(password, user.password)
      : (password === user.password);
    if (!passOk) return err(res, 401, "Invalid email or password");

    const payload = { user_id: user.user_id, role: user.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    // set refresh token vào cookie httpOnly
    res.cookie("rt", refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return ok(res, {
      token: accessToken,
      user: { user_id: user.user_id, full_name: user.full_name, email: user.email, role: user.role }
    });
  } catch (e) {
    console.error(e);
    return err(res);
  }
};

exports.me = (req, res) => {
  return ok(res, req.user);
};

exports.refresh = (req, res) => {
  try {
    const rt = req.cookies?.rt;
    if (!rt) return err(res, 401, "Missing refresh token");
    if (revokedRefreshTokens.has(rt)) return err(res, 401, "Refresh token revoked");

    const decoded = verifyRefresh(rt);
    const accessToken = signAccess({ user_id: decoded.user_id, role: decoded.role });

    return ok(res, { token: accessToken });
  } catch (e) {
    return err(res, 401, "Invalid or expired refresh token");
  }
};

exports.logout = (req, res) => {
  const rt = req.cookies?.rt;
  if (rt) revokedRefreshTokens.add(rt); // tuỳ chọn: thu hồi refresh token hiện tại
  res.clearCookie("rt", { ...cookieOpts });
  return ok(res, { message: "Logged out" });
};

// (tuỳ chọn) đăng ký có hash
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, phone, role } = req.body || {};
    if (!full_name || !email || !password) return err(res, 400, "full_name, email, password are required");
    if (users.some(u => u.email === email)) return err(res, 400, "Email already exists");

    const bcryptHash = await bcrypt.hash(password, 10);
    const { generateId } = require("../utils/generateId");
    const user_id = generateId("u");

    const newUser = {
      user_id, full_name, email,
      phone: phone || null, role: role || "renter",
      password: bcryptHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    };
    users.push(newUser);

    created(res, { user_id });
  } catch (e) {
    console.error(e);
    return err(res);
  }
};
