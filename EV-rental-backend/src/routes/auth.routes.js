const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

router.post("/login", ctrl.login);
router.post("/register", ctrl.register); // tùy chọn
router.get("/me", auth, ctrl.me);
router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);

module.exports = router;
