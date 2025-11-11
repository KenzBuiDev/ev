const API_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

async function request(path, options = {}) {
  // tạo headers mới, gõ tay, không copy
  const headers = options.headers ? { ...options.headers } : {};

  if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";

  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

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

  return json?.data ?? json;
}

export default { request };
