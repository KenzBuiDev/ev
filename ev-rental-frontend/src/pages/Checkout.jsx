// src/pages/Checkout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/fetchClient";

export default function Checkout() {
  const { state } = useLocation();
  const [params] = useSearchParams();
  const nav = useNavigate();

  // 1) cố gắng lấy reservation từ state hoặc sessionStorage
  const [reservation, setReservation] = useState(() => {
    if (state?.reservation) return state.reservation;
    const raw = sessionStorage.getItem("last_reservation");
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return null;
  });

  // 2) nếu state/session không có → lấy rid từ query
  const ridFromQuery = params.get("rid") || undefined;

  // 3) ID sử dụng để thanh toán
  const reservationId = useMemo(
    () => reservation?.reservation_id || ridFromQuery,
    [reservation, ridFromQuery]
  );

  // 4) nếu chỉ có ID mà chưa có chi tiết → fetch lại
  useEffect(() => {
    if (!reservation && ridFromQuery) {
      api.request(`/reservations/${ridFromQuery}`)
        .then((r) => {
          setReservation(r);
          sessionStorage.setItem("last_reservation", JSON.stringify(r));
        })
        .catch(() => {});
    }
  }, [reservation, ridFromQuery]);

  async function onPayVNPay() {
    try {
      if (!reservationId) {
        alert("Thiếu mã đặt chỗ. Hãy quay lại chọn thời gian và đặt chỗ trước.");
        return nav(-1);
      }
      const res = await api.request("/payments/vnpay/create", {
        method: "POST",
        body: JSON.stringify({ reservation_id: reservationId }),
      });
      const { payment_url } = res || {};
      if (!payment_url) throw new Error("Không nhận được payment_url");
      window.location.href = payment_url; // sang trang VNPay (QR)
    } catch (e) {
      alert("Tạo thanh toán lỗi: " + e.message);
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Thanh toán đơn thuê xe</h2>

      <p><b>Mã đặt chỗ:</b> {reservationId || "(chưa có)"}</p>

      <p>
        <b>Thời gian:</b>{" "}
        {reservation?.start_time && reservation?.end_time
          ? `${reservation.start_time} → ${reservation.end_time}`
          : "-"}
      </p>

      <p>
        <b>Tạm tính:</b>{" "}
        {reservation?.estimated_amount ||
          (reservation?.hours && reservation?.currency
            ? `${Number(reservation.hours * (reservation.price_per_hour || 0)).toLocaleString("vi-VN")} ${reservation.currency}`
            : "Đang tính...")}
      </p>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onPayVNPay}>Thanh toán qua VNPay (QR)</button>
        <button onClick={() => nav(-1)}>Quay lại</button>
      </div>
    </div>
  );
}
