// src/utils/jwt.js
const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

exports.signAccess = (payload, opts = {}) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: process.env.JWT_EXPIRES || "12h", ...opts });

exports.verifyAccess = (token) => jwt.verify(token, ACCESS_SECRET);

exports.signRefresh = (payload, opts = {}) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES || "7d", ...opts });

exports.verifyRefresh = (token) => jwt.verify(token, REFRESH_SECRET);
