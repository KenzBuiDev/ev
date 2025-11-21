/**
 * PAYMENTS CONTROLLER
 * 
 * Xử lý thanh toán qua VNPay
 * 
 * Các function chính:
 * 1. createVNPayLink: Tạo link thanh toán
 * 2. vnpReturn: Xử lý callback khi user quay về từ VNPay
 * 3. vnpIpn: Xử lý server-to-server callback từ VNPay
 * 
 * FLOW:
 * Frontend → POST /vnpay/create (tạo link)
 *           ↓
 *         VNPay (user thanh toán)
 *           ↓
 *         Frontend (/payment/return) ← GET /vnpay/return (optional)
 *           ↓
 *         POST /rentals (tạo rental record)
 */

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
// Helper Functions
// -------------------------------------------------------------------------------------

/**
 * Kiểm tra các env vars cần thiết cho VNPay
 */
function ensureEnv() {
  const miss = [];
  if (!VNP_TMN_CODE) miss.push("VNP_TMN_CODE");
  if (!VNP_HASH_SECRET) miss.push("VNP_HASH_SECRET");
  if (miss.length) {
    throw new Error("Missing VNPay env: " + miss.join(", "));
  }
}

/**
 * Lấy IP address của client
 * - Từ X-Forwarded-For header (khi qua proxy)
 * - Hoặc từ socket remote address
 * - Fallback: 127.0.0.1
 */
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
 * Tính số tiền cần thanh toán từ Reservation + Vehicle
 * 
 * Ưu tiên:
 * 1. Nếu reservation.estimated_amount đã được set → dùng luôn
 * 2. Ngược lại → tính từ hours * price_per_hour
 * 
 * @param {string} reservation_id
 * @returns {object} { amountVND, currency }
 */
async function computeAmountFromReservation(reservation_id) {
  // Lấy reservation từ MongoDB
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

  // Nếu end <= start thì cộng thêm 1 giờ (tránh lỗi dữ liệu)
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

/**
 * Tạo link thanh toán VNPay
 * 
 * Request body:
 * {
 *   reservation_id: "rsv001"
 * }
 * 
 * Quá trình:
 * 1. Lấy reservation từ MongoDB
 * 2. Tính amount từ reservation.estimated_amount hoặc từ Vehicle + thời gian
 * 3. Build VNPay params (TMN code, amount, order info, etc)
 * 4. Sign params bằng HMAC SHA512
 * 5. Build payment_url
 * 6. Trả về payment_url cho frontend
 * 
 * Response:
 * {
 *   payment_url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=40000000&vnp_CreateDate=...",
 *   order_id: "20241121123456",
 *   created_at: "2024-11-21T..."
 * }
 */
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

    // Dùng reservation_id làm vnp_TxnRef (để IPN trả về)
    // VNPay yêu cầu: unique và <= 34 ký tự
    const vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: VNP_TMN_CODE,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: reservation_id, // 🔹 khóa để IPN mapping
      vnp_OrderInfo: `Thanh toan dat cho ${reservation_id}`,
      vnp_OrderType: "other",
      vnp_Amount: String(amountForVNP),
      vnp_ReturnUrl: VNP_RETURN_URL,
      vnp_IpAddr: clientIp(req),
      vnp_CreateDate: createDate,
      // vnp_ExpireDate: formatDateVNP(new Date(Date.now() + 15 * 60 * 1000)),
    };

    // Build URL + sign
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
// 2) Return URL (nếu cấu hình VNP_RETURN_URL về backend)
// GET /api/payments/vnpay/return
// -------------------------------------------------------------------------------------

/**
 * Xử lý return URL từ VNPay
 * 
 * Quá trình:
 * 1. VNPay redirect về URL này với query params (vnp_ResponseCode, vnp_TxnRef, etc)
 * 2. Verify signature của params
 * 3. Redirect về frontend (/payment/return) kèm tất cả params
 * 4. Frontend sẽ parse params + tạo rental từ sessionStorage
 * 
 * Note: Thường frontend xử lý phần này, nên return URL có thể trỏ trực tiếp về frontend
 * Backend serve endpoint này chỉ để verify + relay params nếu cần
 */
async function vnpReturn(req, res) {
  try {
    const ok = verifySignature(req.query, VNP_HASH_SECRET);
    if (!ok) {
      return res.status(400).send("Invalid signature");
    }

    // Redirect về frontend /payment/return kèm tất cả params
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
// 3) IPN – server-to-server callback từ VNPay
// GET /api/payments/vnpay/ipn
// -------------------------------------------------------------------------------------

/**
 * IPN (Instant Payment Notification)
 * 
 * VNPay server sẽ call endpoint này để thông báo kết quả giao dịch
 * - VNPay gửi: vnp_ResponseCode, vnp_TxnRef (= reservation_id), vnp_Amount, etc
 * - Backend verify signature
 * - Backend có thể update Reservation.status nếu cần
 * 
 * Response: Luôn trả HTTP 200 + RspCode (theo spec VNPay)
 * - RspCode: "00" = success, "97" = signature fail, "99" = other error
 * 
 * Important: Frontend đã create rental từ PaymentReturn
 * IPN chỉ dùng để verify + update status nếu cần
 */
async function vnpIpn(req, res) {
  try {
    const valid = verifySignature(req.query, VNP_HASH_SECRET);
    if (!valid) {
      // Theo VNPay spec: IPN luôn trả HTTP 200, RspCode khác để báo lỗi
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Invalid signature" });
    }

    // Lấy các param quan trọng
    const vnp_TxnRef = req.query.vnp_TxnRef; // = reservation_id
    const vnp_Amount = req.query.vnp_Amount; // *100
    const vnp_ResponseCode = req.query.vnp_ResponseCode; // '00' = success
    const vnp_TransactionNo = req.query.vnp_TransactionNo || "";
    const vnp_BankTranNo = req.query.vnp_BankTranNo || "";

    // Convert amount về VND
    const amountVND = Number(vnp_Amount || 0) / 100;

    // Map sang reservation
    const reservation_id = vnp_TxnRef;

    // Step 1: Update Reservation status nếu payment thành công
    // Điều này giúp theo dõi trạng thái reservation từ pending -> confirmed
    if (reservation_id && vnp_ResponseCode === "00") {
      await Reservation.findOneAndUpdate(
        { reservation_id },
        { status: "Confirmed" }
      );
    }

    // Step 2: Ghi log payment vào MongoDB để có audit trail
    // Important: Điều này để lại record của mỗi giao dịch VNPay
    // Có thể dùng để reconciliation hoặc debug sau này
    const payment_id = await nextId(Payment, "px", "payment_id");

    await Payment.create({
      payment_id,
      rental_id: null, // TODO: Có thể populate sau khi có mapping reservation -> rental
      type: "Rental Fee",
      amount: `${amountVND} VND`,
      method: "Card",
      provider_ref: vnp_TransactionNo || vnp_BankTranNo, // Reference từ VNPay
      status: vnp_ResponseCode === "00" ? "Success" : "Failed", // Kết quả giao dịch
      paid_at: new Date(),
      handled_by: null, // Có thể gán admin/staff khi verify sau
    });

    // Step 3: Trả HTTP 200 + RspCode = "00" cho VNPay để báo thành công
    // Important: Theo VNPay spec, IPN luôn phải trả HTTP 200
    // VNPay sẽ retry nếu không nhận được HTTP 200, có thể dẫn đến duplicate payment
    // Nếu có lỗi business logic, dùng RspCode khác (không phải HTTP status code khác)
    return res
      .status(200)
      .json({ RspCode: "00", Message: "Confirm Success" });
  } catch (e) {
    console.error("[VNPay][ipn]", e);
    // Trả HTTP 200 với RspCode = "99" để báo lỗi nhưng không dẫn đến retry từ VNPay
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
}

// =============================================================================================
// MODULE EXPORTS
// =============================================================================================

/**
 * Exported functions sử dụng bởi routes/payments.routes.js
 * 
 * createVNPayLink: Tạo payment link (POST /api/payments/vnpay/create)
 *   - Input: { reservation_id }
 *   - Output: { payment_url, order_id, created_at }
 *   - Dùng để redirect user sang VNPay payment page
 * 
 * vnpReturn: Xử lý user redirect từ VNPay (GET /api/payments/vnpay/return)
 *   - Input: Tất cả query params từ VNPay
 *   - Output: Redirect về frontend /payment/return
 *   - Note: Frontend parse params + create rental từ sessionStorage
 * 
 * vnpIpn: Xử lý IPN callback từ VNPay (GET /api/payments/vnpay/ipn)
 *   - Input: Query params từ VNPay server-to-server
 *   - Output: HTTP 200 + { RspCode, Message }
 *   - Side effects: Update Reservation status, ghi Payment log
 */
module.exports = {
  createVNPayLink,
  vnpReturn,
  vnpIpn,
};
