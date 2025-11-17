const express = require("express");
const router = express.Router();

router.use("/", require("./main.routes"));
router.use("/auth", require("./auth.routes"));

router.use("/users", require("./users.routes"));
router.use("/renter-profiles", require("./renterProfiles.routes"));
router.use("/staff-profiles", require("./staffProfiles.routes"));

router.use("/stations", require("./stations.routes"));
router.use("/vehicles", require("./vehicles.routes"));
router.use("/vehicle-images", require("./vehicleImages.routes"));
router.use("/battery-logs", require("./batteryLogs.routes"));

router.use("/reservations", require("./reservations.routes"));   // STAFF bị chặn toàn bộ
router.use("/rentals", require("./rentals.routes"));

router.use("/rental-photos", require("./rentalPhotos.routes"));
router.use("/handovers", require("./handovers.routes"));

router.use("/user-docs", require("./userDocs.routes"));
router.use("/verifications", require("./verifications.routes"));
router.use("/payments", require("./payments.routes"));
router.use("/payments-crud", require("./paymentsCrud.routes"));

router.use("/damage-reports", require("./damageReports.routes")); // STAFF chỉ được xem

module.exports = router;
