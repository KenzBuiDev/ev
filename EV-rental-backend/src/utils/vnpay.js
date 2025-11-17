const crypto = require("crypto");

function formatDateVNP(date) {
  const pad = (n) => (n < 10 ? `0${n}` : String(n));
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

function sortParams(params = {}) {
  return Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
}

function encodeValue(value) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

function buildQuery(params = {}) {
  return Object.keys(params)
    .map((key) => `${key}=${encodeValue(params[key])}`)
    .join("&");
}

function createSecureHash(params, secret) {
  const signData = buildQuery(sortParams(params));
  return crypto
    .createHmac("sha512", secret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
}

function buildSignedUrl(params, baseUrl, secret) {
  const secureHash = createSecureHash(params, secret);
  const signedParams = {
    ...sortParams(params),
    vnp_SecureHashType: "SHA512",
    vnp_SecureHash: secureHash,
  };

  const query = buildQuery(signedParams);
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${query}`;
}

function verifySignature(queryParams, secret) {
  const { vnp_SecureHash, vnp_SecureHashType, ...rest } = queryParams || {};
  if (!vnp_SecureHash) return false;

  const expectedHash = createSecureHash(rest, secret);
  return expectedHash === vnp_SecureHash;
}

module.exports = {
  buildSignedUrl,
  formatDateVNP,
  verifySignature,
};
