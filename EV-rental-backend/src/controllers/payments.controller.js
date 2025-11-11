// src/controllers/payments.controller.js
const payments = require("../models/payments.model");
const rentals = require("../models/rentals.model");
const reservations = require("../models/reservations.model");
const { estimateRentalCost, quoteByTimeRange } = require("../utils/billing");
const { ok, err } = require("../utils/response");
const { buildPaymentUrl, verifyVnpaySignature } = require("../utils/vnpay");

// Tạo link/QR VNPay cho reservation (hoặc rental)
exports.createVnpayPayment = (req, res) => {
  try {
    const { reservation_id, rental_id, bankCode } = req.body || {};
    if (!reservation_id && !rental_id)
      return err(res, 400, "reservation_id or rental_id is required");

    let amount = 0, orderId = "", orderInfo = "";

    if (reservation_id) {
      const rsv = reservations.find(x => x.reservation_id === reservation_id);
      if (!rsv) return err(res, 404, "Reservation not found");
      amount = rsv.estimated_amount
        ? parseInt(String(rsv.estimated_amount).replace(/[^\d]/g, ""), 10)
        : quoteByTimeRange({ vehicle_id: rsv.vehicle_id, start_time: rsv.start_time, end_time: rsv.end_time }).amount;
      orderId = `RSV${reservation_id}`;
      orderInfo = `Thanh toan dat cho ${reservation_id}`;
    } else {
      const rental = rentals.find(r => r.rental_id === rental_id);
      if (!rental) return err(res, 404, "Rental not found");
      amount = rental.final_cost
        ? parseInt(String(rental.final_cost).replace(/[^\d]/g, ""), 10)
        : estimateRentalCost({
            vehicle_id: rental.vehicle_id,
            start: rental.start_actual,
            end: rental.end_actual || new Date(new Date(rental.start_actual).getTime() + 60*60*1000).toISOString()
          }).estimated_amount;
      orderId = `RT${rental_id}`;
      orderInfo = `Thanh toan don thue ${rental_id}`;
    }

    const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const payment_url = buildPaymentUrl({ amountVND: amount, orderId, orderInfo, ipAddr, bankCode });
    ok(res, { payment_url, amount });
  } catch (e) {
    console.error(e);
    err(res);
  }
};

// Return URL (user quay về)
exports.vnpayReturn = (req, res) => {
  try {
    const valid = verifyVnpaySignature(req.query);
    if (!valid) return err(res, 400, "Invalid signature");
    const { vnp_ResponseCode, vnp_TxnRef, vnp_Amount, vnp_TransactionNo } = req.query;
    ok(res, {
      status: vnp_ResponseCode === "00" ? "success" : "failed",
      txn_ref: vnp_TxnRef,
      amount: Number(vnp_Amount) / 100,
      vnp_txn_no: vnp_TransactionNo,
    });
  } catch (e) {
    console.error(e);
    err(res);
  }
};

// IPN (server-to-server) — nhớ cấu hình HTTPS ngoài production
exports.vnpayIpn = (req, res) => {
  try {
    const valid = verifyVnpaySignature(req.query);
    if (!valid) return res.json({ RspCode: "97", Message: "Invalid signature" });

    const { vnp_ResponseCode, vnp_TxnRef, vnp_Amount, vnp_TransactionNo } = req.query;
    const ref = String(vnp_TxnRef || "");
    const isReservation = ref.startsWith("RSV");
    const isRental = ref.startsWith("RT");

    // Idempotency: nếu provider_ref đã tồn tại thì bỏ qua
    const existed = payments.find(p => p.provider_ref === vnp_TransactionNo);
    if (existed) return res.json({ RspCode: "00", Message: "Already processed" });

    if (isReservation) {
      const reservation_id = ref.replace(/^RSV/, "");
      const rsv = reservations.find(r => r.reservation_id === reservation_id);
      if (!rsv) return res.json({ RspCode: "01", Message: "Order not found" });

      if (vnp_ResponseCode === "00") rsv.status = "Confirmed";

      payments.push({
        payment_id: `px${Date.now()}`,
        reservation_id,
        rental_id: null,
        type: "Rental Fee",
        amount: `${Number(vnp_Amount) / 100} VND`,
        method: "VNPay",
        provider_ref: vnp_TransactionNo,
        status: vnp_ResponseCode === "00" ? "Success" : "Failed",
        paid_at: new Date().toISOString(),
        handled_by: null,
      });

      return res.json({ RspCode: "00", Message: "Confirm Success" });
    }

    if (isRental) {
      const rental_id = ref.replace(/^RT/, "");
      const rental = rentals.find(r => r.rental_id === rental_id);
      if (!rental) return res.json({ RspCode: "01", Message: "Order not found" });

      payments.push({
        payment_id: `px${Date.now()}`,
        reservation_id: null,
        rental_id,
        type: "Rental Fee",
        amount: `${Number(vnp_Amount) / 100} VND`,
        method: "VNPay",
        provider_ref: vnp_TransactionNo,
        status: vnp_ResponseCode === "00" ? "Success" : "Failed",
        paid_at: new Date().toISOString(),
        handled_by: rental.checkin_staff_id || rental.checkout_staff_id || null,
      });

      return res.json({ RspCode: "00", Message: "Confirm Success" });
    }

    return res.json({ RspCode: "01", Message: "Invalid order ref" });
  } catch (e) {
    console.error(e);
    return res.json({ RspCode: "99", Message: "Unknown error" });
  }
};
