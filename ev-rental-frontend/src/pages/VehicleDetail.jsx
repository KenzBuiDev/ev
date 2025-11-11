// src/pages/VehicleDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/fetchClient";

// Chuẩn hóa khoảng thời gian: nếu end <= start thì hiểu là qua ngày hôm sau
function normalizeRange(startLocal, endLocal) {
  const s = new Date(startLocal);
  let e = new Date(endLocal);
  if (isNaN(+s) || isNaN(+e)) throw new Error("Thời gian không hợp lệ");
  if (e <= s) e = new Date(e.getTime() + 24 * 60 * 60 * 1000);
  return { startISO: s.toISOString(), endISO: e.toISOString() };
}

export default function VehicleDetail() {
  const { id } = useParams(); // vehicle_id từ /vehicles/:id
  const nav = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [startTime, setStartTime] = useState(""); // datetime-local
  const [endTime, setEndTime] = useState("");     // datetime-local
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  // Tải thông tin xe (nếu BE có endpoint /vehicles/:id)
  useEffect(() => {
    api.request(`/vehicles/${id}`).then(setVehicle).catch(() => {});
  }, [id]);

  async function handleQuote() {
    setLoading(true);
    try {
      const { startISO, endISO } = normalizeRange(startTime, endTime);
      const q = await api.request("/billing/quote", {
        method: "POST",
        body: JSON.stringify({
          vehicle_id: id,
          start_time: startISO,
          end_time: endISO,
        }),
      });
      setQuote(q); // q = { hours, price_per_hour, billing_unit, currency, amount }
    } catch (e) {
      alert("Báo giá thất bại: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReserve() {
    if (!quote) return alert("Bạn cần báo giá trước");
    try {
      const { startISO, endISO } = normalizeRange(startTime, endTime);
      const reservation = await api.request("/reservations", {
        method: "POST",
        body: JSON.stringify({
          vehicle_id: id,
          start_time: startISO,
          end_time: endISO,
        }),
      });
      // Lưu backup đề phòng refresh / mở tab mới
      sessionStorage.setItem("last_reservation", JSON.stringify(reservation));
      // Điều hướng kèm rid (reservation_id)
      nav(`/checkout?rid=${encodeURIComponent(reservation.reservation_id)}`, {
        state: { reservation },
      });
    } catch (e) {
      alert("Tạo đặt chỗ lỗi: " + e.message);
    }
  }

  if (!vehicle) return <div>Đang tải...</div>;

  return (
    <div style={{ maxWidth: 800 }}>
      <h2>{vehicle.name || `Xe ${id}`}</h2>
      {vehicle.image_url && (
        <img
          src={vehicle.image_url}
          alt={vehicle.name || id}
          style={{ width: "100%", maxHeight: 420, objectFit: "cover" }}
        />
      )}
      <p>Loại: {vehicle.type}</p>
      <p>Giá thuê: {Number(vehicle.price_per_hour || 0).toLocaleString("vi-VN")} VNĐ/giờ</p>
      <p>Trạng thái: {vehicle.status}</p>

      <hr />
      <h3>Đặt xe</h3>
      <div className="grid gap-2" style={{ maxWidth: 360 }}>
        <label>
          Giờ bắt đầu:
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>
        <label>
          Giờ kết thúc:
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </label>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button disabled={loading} onClick={handleQuote}>Báo giá</button>
          {quote && (
            <button disabled={loading} onClick={handleReserve}>
              Xác nhận thuê xe
            </button>
          )}
        </div>
      </div>

      {quote && (
        <>
          <h4 style={{ marginTop: 16 }}>Báo giá</h4>
          <p>Thời gian: {quote.hours} giờ</p>
          <p>
            Đơn giá: {Number(quote.price_per_hour).toLocaleString("vi-VN")}{" "}
            {quote.currency || "VNĐ"}/{quote.billing_unit || "giờ"}
          </p>
          <p>
            Tổng cộng:{" "}
            <b>
              {Number(quote.amount).toLocaleString("vi-VN")} {quote.currency || "VNĐ"}
            </b>
          </p>
        </>
      )}
    </div>
  );
}
