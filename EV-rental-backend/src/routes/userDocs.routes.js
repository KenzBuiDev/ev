const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/userDocs.controller");
const auth = require("../middleware/auth");
const { requireRole, requireSelfOrRole } = require("../middleware/authorize");

// List: admin xem hết; người dùng chỉ xem docs của chính họ (ép query user_id = self)
router.get("/", auth, (req, res, next) => {
  if (req.user.role === "admin") return next();
  req.query.user_id = req.user.user_id;
  next();
}, ctrl.list);

// Detail: self hoặc admin
router.get("/:id", auth, ctrl.getById); // (controller tự kiểm tra cũng OK, giữ đơn giản)

// Create: self hoặc admin
router.post("/", auth, (req, res, next) => {
  if (req.user.role === "admin") return next();
  req.body.user_id = req.user.user_id; // ép về self
  next();
}, ctrl.create);

// Update metadata: self hoặc admin
router.patch("/:id", auth, requireSelfOrRole(
  (req) => {
    const docs = require("../models/userDocs.model");
    const d = docs.find(x => x.doc_id === req.params.id);
    return d?.user_id;
  }, "admin"
), ctrl.update);

// Verify: chỉ staff/admin? (yêu cầu của bạn: staff chỉ xem DamageReports, không ảnh hưởng userDocs)
// → Theo chính sách cũ: cho admin (và có thể staff nếu muốn). Ở đây CHỈ admin:
router.patch("/:id/verify", auth, requireRole("admin"), ctrl.verify);

// Delete: admin
router.delete("/:id", auth, requireRole("admin"), ctrl.remove);

module.exports = router;
