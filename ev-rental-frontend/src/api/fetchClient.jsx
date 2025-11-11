// src/api/fetchClient.jsx
const API_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

async function request(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";

  // Lấy JWT (đặt tên khóa là access_token)
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(API_URL + path, { ...options, headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      json?.error?.message ||
      json?.message ||
      res.statusText ||
      "Request failed";
    throw new Error(msg);
  }

  // ✅ Tự động “bóc” { success, data } nếu backend có bọc
  return json?.data ?? json;
}

export default { request };
