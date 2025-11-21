// src/pages/Checkout.jsx
/**
 * TRANG THANH TOÁN
 * 
 * FLOW:
 * 1. Nhận reservation từ VehicleDetail page (qua state hoặc sessionStorage)
 * 2. Hiển thị thông tin đặt chỗ (xe, thời gian, giá)
 * 3. User click "Thanh toán qua VNPay" → gửi POST /payments/vnpay/create
 * 4. Nhận payment_url từ server → redirect sang VNPay gateway
 * 5. VNPay xử lý giao dịch → redirect về /payment/return?vnp_ResponseCode=...
 */
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/fetchClient";
import '../styles/Checkout.css';

export default function Checkout() {
  const { state } = useLocation(); // Lấy dữ liệu từ state (khi navigate từ VehicleDetail)
  const [params] = useSearchParams(); // Lấy URL params (rid=...)
  const nav = useNavigate();

  /**
   * KHÔI PHỤC RESERVATION
   * Thứ tự ưu tiên:
   * 1. Từ state (được gửi khi navigate từ VehicleDetail)
   * 2. Từ sessionStorage (fallback nếu user refresh trang / mở link trực tiếp)
   * 3. Null (nếu không có, sẽ fetch lại từ server)
   */
  const [reservation, setReservation] = useState(() => {
    if (state?.reservation) {
      console.log("✓ Reservation từ state (tìm thấy):", state.reservation);
      return state.reservation;
    }
    const raw = sessionStorage.getItem("last_reservation");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        console.log("✓ Reservation từ sessionStorage (tìm thấy):", parsed);
        return parsed;
      } catch (e) {
        console.error("✗ Lỗi parse sessionStorage:", e);
      }
    }
    console.warn("⚠ Chưa tìm thấy reservation, sẽ fetch từ server...");
    return null;
  });

  // Lấy reservation_id từ URL params (rid=...)
  const ridFromQuery = params.get("rid") || undefined;

  /**
   * Lấy reservation_id để dùng khi thanh toán
   * Ưu tiên: từ object reservation → từ URL params
   */
  const reservationId = useMemo(
    () => reservation?.reservation_id || ridFromQuery,
    [reservation, ridFromQuery]
  );

  /**
   * NẾU CHỈ CÓ ID MÀ CHƯA CÓ CHI TIẾT → FETCH LẠI TỪ SERVER
   * 
   * Trường hợp: user refresh trang / mở link trực tiếp
   * - Sẽ không có state (vì state mất khi refresh)
   * - Sẽ không có sessionStorage nếu private window
   * - Nhưng sẽ có rid trong URL → fetch lại từ server
   * 
   * API: GET /reservations/:id
   * Response: { reservation_id, vehicle_id, start_time, end_time, hours, price_per_hour, ... }
   */
  useEffect(() => {
    if (!reservation && ridFromQuery) {
      console.log("Fetching reservation từ server:", ridFromQuery);
      api.request(`/reservations/${ridFromQuery}`)
        .then((r) => {
          console.log("✓ Fetched reservation từ server:", r);

          // Tính toán estimated_amount nếu server không trả về
          const enrichedReservation = r;
          if (!enrichedReservation.estimated_amount && enrichedReservation.hours && enrichedReservation.price_per_hour) {
            enrichedReservation.estimated_amount = enrichedReservation.hours * enrichedReservation.price_per_hour;
          }

          setReservation(enrichedReservation);
          // Lưu vào sessionStorage để dùng lại nếu user tiếp tục
          sessionStorage.setItem("last_reservation", JSON.stringify(enrichedReservation));
        })
        .catch((e) => {
          console.error("✗ Lỗi fetch reservation:", e);
        });
    }
  }, [reservation, ridFromQuery]);

  /**
   * KHỞI TẠO THANH TOÁN VIA VNPAY
   * 
   * API: POST /payments/vnpay/create
   * 
   * Input body:
   * {
   *   reservation_id: "rsv001"
   * }
   * 
   * Response: {
   *   payment_url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=...",
   *   order_id: "20241121...",
   *   created_at: "2024-11-21T..."
   * }
   * 
   * Lưu ý:
   * - Redirect tới payment_url sẽ mở VNPay gateway
   * - Sau khi user thanh toán, VNPay sẽ redirect về /payment/return?vnp_ResponseCode=...
   * - sessionStorage vẫn giữ reservation data để PaymentReturn dùng
   */
  async function onPayVNPay() {
    try {
      if (!reservationId) {
        alert("Thiếu mã đặt chỗ. Hãy quay lại chọn thời gian và đặt chỗ trước.");
        return nav(-1);
      }

      console.log("📤 Bắt đầu thanh toán VNPay với reservation:", reservation);
      console.log("📦 SessionStorage hiện tại:", sessionStorage.getItem("last_reservation"));

      // Gửi API tạo link thanh toán
      const res = await api.request("/payments/vnpay/create", {
        method: "POST",
        body: JSON.stringify({ reservation_id: reservationId }),
      });
      const { payment_url } = res || {};
      if (!payment_url) throw new Error("Không nhận được payment_url từ server");

      console.log("✓ Nhận payment_url, chuyển hướng sang VNPay...");
      // Redirect sang VNPay gateway (QR code hoặc form nhập thẻ)
      window.location.href = payment_url;
    } catch (e) {
      alert("Tạo thanh toán lỗi: " + e.message);
      console.error("✗ Payment error:", e);
    }
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h2>Thanh toán đơn thuê xe</h2>
      </div>

      <div className="checkout-content">
        <div className="checkout-form">
          <h3>Thông tin đặt chỗ</h3>
          <div className="form-section">
            <p className="summary-item">
              <span className="summary-label">Mã đặt chỗ:</span>
              <span className="summary-value">{reservationId || "(chưa có)"}</span>
            </p>
          </div>

          <div className="form-section">
            <h4>Thời gian</h4>
            <p className="summary-item">
              <span className="summary-label">Từ:</span>
              <span className="summary-value">{reservation?.start_time || "-"}</span>
            </p>
            <p className="summary-item">
              <span className="summary-label">Đến:</span>
              <span className="summary-value">{reservation?.end_time || "-"}</span>
            </p>
          </div>

          <div className="form-section">
            <h4>Xe được chọn</h4>
            <p className="summary-item">
              <span className="summary-label">Vehicle ID:</span>
              <span className="summary-value">{reservation?.vehicle_id || "-"}</span>
            </p>
          </div>
        </div>

        <div className="checkout-summary">
          <h3>Tóm tắt</h3>

          {reservation && (
            <>
              <div className="summary-item">
                <span className="summary-label">Số giờ:</span>
                <span className="summary-value">{reservation.hours || "-"}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Giá/giờ:</span>
                <span className="summary-value">
                  {reservation.price_per_hour ? `${Number(reservation.price_per_hour).toLocaleString("vi-VN")}` : "-"}
                </span>
              </div>
            </>
          )}

          <div className="total-amount">
            <span>Tạm tính:</span>
            <span>
              {reservation?.estimated_amount ||
                (reservation?.hours && reservation?.price_per_hour
                  ? `${Number(reservation.hours * reservation.price_per_hour).toLocaleString("vi-VN")} ₫`
                  : "Đang tính...")}
            </span>
          </div>

          <button className="checkout-button" onClick={onPayVNPay}>
            Thanh toán qua VNPay (QR)
          </button>
          <button className="checkout-button" onClick={() => nav(-1)} style={{ marginTop: 10, background: '#e0e0e0', color: '#333' }}>
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
