// src/utils/vnpay.js
const crypto = require("crypto");
const qs = require("qs");

function sortObject(obj) {
  const sorted = {};
  Object.keys(obj).sort().forEach(k => (sorted[k] = obj[k]));
  return sorted;
}

function toYmdHms(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return d.getFullYear()
    + pad(d.getMonth() + 1)
    + pad(d.getDate())
    + pad(d.getHours())
    + pad(d.getMinutes())
    + pad(d.getSeconds());
}

exports.buildPaymentUrl = ({ amountVND, orderId, orderInfo, ipAddr, bankCode }) => {
  const vnp_TmnCode    = process.env.VNP_TMN_CODE;
  const vnp_HashSecret = process.env.VNP_HASH_SECRET;
  const vnp_Url        = process.env.VNP_URL;
  const vnp_ReturnUrl  = process.env.VNP_RETURN_URL;

  const now = new Date();
  const vnp_CreateDate = toYmdHms(now);
  const vnp_ExpireDate = toYmdHms(new Date(now.getTime() + 15 * 60 * 1000)); // 15'

  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode,
    vnp_Amount: amountVND * 100,           // *100 theo VNPay
    vnp_CreateDate,
    vnp_ExpireDate,                        // NEW
    vnp_CurrCode: "VND",
    vnp_IpAddr: ipAddr || "127.0.0.1",
    vnp_Locale: "vn",
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_ReturnUrl: vnp_ReturnUrl,
    vnp_TxnRef: orderId,                   // duy nhất
  };
  if (bankCode) params.vnp_BankCode = bankCode;

  const sorted = sortObject(params);
  const signData = qs.stringify(sorted, { encode: false });
  const secureHash = crypto.createHmac("sha512", vnp_HashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
  sorted.vnp_SecureHash = secureHash;

  return vnp_Url + "?" + qs.stringify(sorted, { encode: true });
};

exports.verifyVnpaySignature = (rawQuery) => {
  const { vnp_SecureHash, vnp_SecureHashType, ...rest } = rawQuery;
  const vnp_HashSecret = process.env.VNP_HASH_SECRET;
  const sorted = sortObject(rest);
  const signData = qs.stringify(sorted, { encode: false });
  const signed = crypto.createHmac("sha512", vnp_HashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
  return signed === vnp_SecureHash;
};
