const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(path, options = {}) {
    const headers = options.headers || {};
    headers["Content-Type"] = "application/json";

    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(API_URL + path, { ...options, headers });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || res.statusText || "Request failed");
    }

    return res.json();
}

export default { request };
