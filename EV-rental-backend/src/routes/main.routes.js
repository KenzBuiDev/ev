const express = require("express");
const router = express.Router();
const main = require("../controllers/main.controller");

router.get("/", main.root);
router.get("/health", main.health);
router.get("/info", main.info);
router.get("/routes", main.routes);
router.get("/summary", main.summary);
router.get("/stats", main.stats);

module.exports = router;
