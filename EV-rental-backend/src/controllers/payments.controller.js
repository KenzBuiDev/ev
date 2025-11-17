// src/controllers/payments.controller.js
const { buildSignedUrl, formatDateVNP, verifySignature } = require("../utils/vnpay");
const Reservation = require("../models/Reservation");
const Vehicle = require("../models/Vehicle");
const Payment = require("../models/Payment");
const { nextId } = require("../utils/idHelper");

const VNP_TMN_CODE = process.env.VNP_TMN_CODE;
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET;
const VNP_URL =
  process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNP_RETURN_URL =
  process.env.VNP_RETURN_URL || "http://localhost:5173/payment/return";

// -------------------------------------------------------------------------------------
// Helper
// -------------------------------------------------------------------------------------

function ensureEnv() {
  const miss = [];
  if (!VNP_TMN_CODE) miss.push("VNP_TMN_CODE");
  if (!VNP_HASH_SECRET) miss.push("VNP_HASH_SECRET");
  if (miss.length) {
    throw new Error("Missing VNPay env: " + miss.join(", "));
  }
}

function clientIp(req) {
  return (
    (req.headers["x-forwarded-for"] || "")
      .toString()
      .split(",")[0]
      .trim() ||
    req.socket?.remoteAddress ||
    "127.0.0.1"
  );
}

/**
 * Tính số tiền cần thanh toán dựa trên Reservation + Vehicle trong Mongo
 * Ưu tiên dùng reservation.estimated_amount nếu đã được set.
 */
async function computeAmountFromReservation(reservation_id) {
  // Lấy reservation từ Mongo
  const rsv = await Reservation.findOne({ reservation_id }).lean();
  if (!rsv) throw new Error("Reservation not found");

  // Nếu đã có estimated_amount thì dùng luôn
  if (typeof rsv.estimated_amount === "number" && !isNaN(rsv.estimated_amount)) {
    return {
      amountVND: rsv.estimated_amount,
      currency: rsv.currency || "VND",
    };
  }

  // Ngược lại: tính lại từ Vehicle + thời gian
  const vehicle = await Vehicle.findOne({ vehicle_id: rsv.vehicle_id }).lean();
  if (!vehicle) {
    throw new Error("Vehicle not found for reservation");
  }

  const start = new Date(rsv.start_time);
  let end = new Date(rsv.end_time);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid start_time or end_time");
  }

  // nếu end <= start thì cộng thêm 1 ngày cho chắc (tránh case lỗi dữ liệu)
  if (end <= start) {
    end = new Date(start.getTime() + 60 * 60 * 1000); // mặc định 1h
  }

  const ms = end - start;
  const hours = Math.ceil(ms / 3600000); // làm tròn lên giờ
  const price = Number(vehicle.price_per_hour || 0);
  const amount = hours * price;

  return {
    amountVND: amount,
    currency: vehicle.currency || "VND",
  };
}

// -------------------------------------------------------------------------------------
// 1) Tạo link thanh toán VNPay
// POST /api/payments/vnpay/create
// body: { reservation_id }
// -------------------------------------------------------------------------------------

async function createVNPayLink(req, res) {
  try {
    ensureEnv();

    const { reservation_id } = req.body || {};
    if (!reservation_id) {
      return res.status(400).json({ message: "reservation_id is required" });
    }

    // Từ Mongo: tính số tiền cần thanh toán
    const { amountVND } = await computeAmountFromReservation(reservation_id);
    const amountNumber = Number(amountVND) || 0;
    if (amountNumber <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid amount from reservation" });
    }

    // VNPay yêu cầu vnp_Amount = số tiền * 100
    const amountForVNP = amountNumber * 100;

    const createDate = formatDateVNP(new Date());

    // Để dễ mapping IPN, mình dùng luôn reservation_id làm vnp_TxnRef
    // (VNPay chỉ yêu cầu unique và <= 34 ký tự)
    const vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: VNP_TMN_CODE,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: reservation_id, // 🔹 khóa chính để IPN trả về
      vnp_OrderInfo: `Thanh toan dat cho ${reservation_id}`,
      vnp_OrderType: "other",
      vnp_Amount: String(amountForVNP),
      vnp_ReturnUrl: VNP_RETURN_URL,
      vnp_IpAddr: clientIp(req),
      vnp_CreateDate: createDate,
      // vnp_ExpireDate: formatDateVNP(new Date(Date.now() + 15 * 60 * 1000)),
    };

    const payment_url = buildSignedUrl(vnpParams, VNP_URL, VNP_HASH_SECRET);
    return res.json({ payment_url });
  } catch (e) {
    console.error("[VNPay][create] ", e);
    return res
      .status(400)
      .json({ message: e.message || "Create VNPay link failed" });
  }
}

// -------------------------------------------------------------------------------------
// 2) Return URL (nếu bạn cấu hình VNP_RETURN_URL về backend)
// GET /api/payments/vnpay/return
// -------------------------------------------------------------------------------------

async function vnpReturn(req, res) {
  try {
    const ok = verifySignature(req.query, VNP_HASH_SECRET);
    if (!ok) {
      return res.status(400).send("Invalid signature");
    }

    // Thường thì mình chỉ redirect về front-end để FE đọc query & hiển thị trạng thái
    const feUrl = `http://localhost:5173/payment/return?${new URLSearchParams(
      req.query
    ).toString()}`;
    return res.redirect(feUrl);
  } catch (e) {
    console.error("[VNPay][return]", e);
    return res.status(400).send("Return failed");
  }
}

// -------------------------------------------------------------------------------------
// 3) IPN – server-to-server (VNPay gọi sang để xác nhận trạng thái giao dịch)
// GET /api/payments/vnpay/ipn
// -------------------------------------------------------------------------------------

async function vnpIpn(req, res) {
  try {
    const valid = verifySignature(req.query, VNP_HASH_SECRET);
    if (!valid) {
      // Theo tài liệu VNPay, IPN phải luôn trả HTTP 200,
      // nhưng RspCode khác nhau để báo lỗi/ok
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Invalid signature" });
    }

    // Một số trường quan trọng từ VNPay
    const vnp_TxnRef = req.query.vnp_TxnRef; // ở trên mình set = reservation_id
    const vnp_Amount = req.query.vnp_Amount; // *100
    const vnp_ResponseCode = req.query.vnp_ResponseCode; // '00' = thành công
    const vnp_TransactionNo = req.query.vnp_TransactionNo || ""; // mã giao dịch bên VNPay
    const vnp_BankTranNo = req.query.vnp_BankTranNo || "";

    // Chuyển amount về VND bình thường
    const amountVND = Number(vnp_Amount || 0) / 100;

    // Cố gắng map sang reservation
    const reservation_id = vnp_TxnRef;

    // Tùy design: bạn có thể update Reservation.status tại đây
    // Ví dụ (chỉ demo, không bắt buộc):
    if (reservation_id && vnp_ResponseCode === "00") {
      await Reservation.findOneAndUpdate(
        { reservation_id },
        { status: "Confirmed" }
      );
    }

    // Ghi log payment vào Mongo (optional nhưng rất nên)
    const payment_id = await nextId(Payment, "px", "payment_id");

    await Payment.create({
      payment_id,
      rental_id: null, // nếu bạn có mapping reservation -> rental thì set sau
      type: "Rental Fee",
      amount: `${amountVND} VND`,
      method: "Card",
      provider_ref: vnp_TransactionNo || vnp_BankTranNo,
      status: vnp_ResponseCode === "00" ? "Success" : "Failed",
      paid_at: new Date(),
      handled_by: null, // có thể gán admin/staff sau
    });

    // Trả về cho VNPay biết là mình đã xử lý xong
    return res
      .status(200)
      .json({ RspCode: "00", Message: "Confirm Success" });
  } catch (e) {
    console.error("[VNPay][ipn]", e);
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
}

module.exports = {
  createVNPayLink,
  vnpReturn,
  vnpIpn,
};
